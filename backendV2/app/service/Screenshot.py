# import platform
# import time
# from pathlib import Path
# from selenium import webdriver
# from selenium.common.exceptions import WebDriverException
# from selenium.webdriver.chrome.service import Service as ChromeService
# from selenium.webdriver.chrome.options import Options as ChromeOptions
# from selenium.webdriver.firefox.service import Service as FirefoxService
# from selenium.webdriver.firefox.options import Options as FirefoxOptions
# from selenium.webdriver.edge.service import Service as EdgeService
# from selenium.webdriver.edge.options import Options as EdgeOptions
# from webdriver_manager.chrome import ChromeDriverManager
# from webdriver_manager.firefox import GeckoDriverManager
# from webdriver_manager.microsoft import EdgeChromiumDriverManager

# from app.modal import PredictRequestByUrl, savedPairPaths

# def get_driver(browser_name):
#     browser_name = browser_name.lower()

#     if browser_name == "chrome":
#         options = ChromeOptions()
#         options.add_argument("--headless")
#         driver = webdriver.Chrome(service=ChromeService(ChromeDriverManager().install()), options=options)
#         return driver

#     if browser_name == "firefox":
#         options = FirefoxOptions()
#         options.add_argument("--headless")
#         try:
#             driver = webdriver.Firefox(service=FirefoxService(GeckoDriverManager().install()), options=options)
#             return driver
#         except WebDriverException as e:
#             # Common issue: Firefox binary not installed or not found
#             if "Expected browser binary location" in str(e) or "Unable to find" in str(e):
#                 raise RuntimeError("Firefox binary not found. Install Firefox or set the binary path via 'moz:firefoxOptions.binary'.") from e
#             raise

#     if browser_name == "edge":
#         options = EdgeOptions()
#         options.add_argument("--headless")
#         driver = webdriver.Edge(service=EdgeService(EdgeChromiumDriverManager().install()), options=options)
#         return driver

#     if browser_name == "safari":
#         # Safari's WebDriver (safaridriver) is only available on macOS
#         driver = webdriver.Safari()
#         return driver

#     raise ValueError(f"Browser '{browser_name}' not supported on {platform.system()}")




# def capture_full_page(url, browser_name, save_path):
#     browser_name = browser_name.lower()

#     # Safari only works on macOS
#     if browser_name == "safari" and platform.system().lower() != "darwin":
#         raise ValueError("Safari is only supported on macOS")

#     try:
#         driver = get_driver(browser_name)
#         driver.get(url)
#         time.sleep(2)  # wait for page load

#         # Get full page dimensions (use max of body and documentElement for reliability)
#         # total_width = driver.execute_script(
#         #     "return Math.max(document.body.scrollWidth, document.documentElement.scrollWidth);"
#         # )
#         total_width = 1920
#         total_height = 1080
#         # total_height = driver.execute_script(
#         #     "return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);"
#         # )

#         # Set window size and capture full page screenshot
#         driver.set_window_size(total_width, total_height)
#         time.sleep(1)  # let resize take effect

#         driver.save_screenshot(save_path)
#         print(f"[✓] Full-page screenshot saved: {save_path}")

#     except Exception as e:
#         print(f"[x] {browser_name} failed: {e}")
#     finally:
#         if 'driver' in locals():
#             driver.quit()


# def capture(req: PredictRequestByUrl):
#     upload_dir = Path(f"upload_image/{req.user_id}/{req.pair_id}")
#     upload_dir.mkdir(parents=True, exist_ok=True)
#     base_url = "http://127.0.0.1:8080/static"

#     saved_paths = []

#     for pair in req.image_list:
#             timestamp = int(time.time() * 1000)
#             file_name = f"{pair.os}_{pair.browser}_{timestamp}.png"
#             file_path = upload_dir / f"{file_name}"
            
#             try:
#                 capture_full_page(
#                     url=req.image_url,
#                     browser_name=pair.browser,
#                     save_path=file_path
#                 )
#                 file_url = f"{base_url}/{req.user_id}/{req.pair_id}/{file_name}"
#                 saved_path = savedPairPaths(
#                     pair_id=req.pair_id,
#                     image_name=file_name,
#                     image_url=file_url,
#                     browser=pair.browser,
#                     os=pair.os,
#                     image_path=file_path.as_posix() )
                
#                 saved_paths.append(saved_path)
#             except Exception as e:
#                 print(f"Error capturing screenshot for URL {req.image_url} with browser {pair.browser}: {e}")

#     return saved_paths


import base64
import platform
import time
from pathlib import Path

from selenium import webdriver
from selenium.common.exceptions import WebDriverException

from selenium.webdriver.chrome.options import Options as ChromeOptions

from selenium.webdriver.firefox.service import Service as FirefoxService
from selenium.webdriver.firefox.options import Options as FirefoxOptions

from selenium.webdriver.edge.options import Options as EdgeOptions

from selenium.webdriver.support.ui import WebDriverWait

from webdriver_manager.firefox import GeckoDriverManager

from app.modal import PredictRequestByUrl, savedPairPaths


def _base_headless_args(options, browser: str):
    """
    Shared stable args for Chromium-based headless (Chrome/Edge).
    """
    options.add_argument("--headless=new")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-features=NetworkService,NetworkServiceInProcess")
    options.add_argument("--hide-scrollbars")
    options.add_argument("--force-device-scale-factor=1")
    options.add_argument("--window-size=1920,1080")

    options.add_argument("--lang=en-US")
    options.add_argument(
        "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )


def get_driver(browser_name: str):
    browser_name = (browser_name or "").lower().strip()

    if browser_name == "chrome":
        # Let Selenium Manager auto-detect chromedriver (same approach as Edge)
        # This avoids version mismatch issues from webdriver_manager
        options = ChromeOptions()
        _base_headless_args(options, "chrome")
        return webdriver.Chrome(options=options)

    if browser_name == "firefox":
        options = FirefoxOptions()
        options.add_argument("-headless")
        try:
            return webdriver.Firefox(
                service=FirefoxService(GeckoDriverManager().install()),
                options=options
            )
        except WebDriverException as e:
            if "Expected browser binary location" in str(e) or "Unable to find" in str(e):
                raise RuntimeError(
                    "Firefox binary not found. Install Firefox or set binary path via FirefoxOptions().binary_location."
                ) from e
            raise

    if browser_name == "edge":
        # Use Selenium Manager instead of webdriver_manager for Edge
        # This prevents the "Could not reach host" download error.
        options = EdgeOptions()
        options.use_chromium = True
        _base_headless_args(options, "edge")

        # Optional automation flags
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option("useAutomationExtension", False)

        return webdriver.Edge(options=options)

    if browser_name == "safari":
        if platform.system().lower() != "darwin":
            raise ValueError("Safari is only supported on macOS")
        return webdriver.Safari()

    raise ValueError(f"Browser '{browser_name}' not supported on {platform.system()}")


def capture_full_page(url: str, browser_name: str, save_path: Path):
    browser_name = (browser_name or "").lower().strip()

    if browser_name == "safari" and platform.system().lower() != "darwin":
        raise ValueError("Safari is only supported on macOS")

    driver = None
    try:
        driver = get_driver(browser_name)
        driver.get(url)

        WebDriverWait(driver, 15).until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )

        time.sleep(0.7)

        # Get full page dimensions
        total_width = driver.execute_script(
            "return Math.max(document.body.scrollWidth, "
            "document.documentElement.scrollWidth, 1920)"
        )
        total_height = driver.execute_script(
            "return Math.max(document.body.scrollHeight, "
            "document.documentElement.scrollHeight)"
        )

        if browser_name in ("chrome", "edge"):
            driver.set_window_size(total_width, total_height)
            time.sleep(0.3)

            try:
                # Try CDP full-page screenshot first
                result = driver.execute_cdp_cmd("Page.captureScreenshot", {
                    "format": "png",
                    "captureBeyondViewport": True,
                    "clip": {
                        "x": 0,
                        "y": 0,
                        "width": total_width,
                        "height": total_height,
                        "scale": 1
                    }
                })
                with open(str(save_path), "wb") as f:
                    f.write(base64.b64decode(result["data"]))

            except Exception as cdp_err:
                print(f"[!] CDP screenshot failed, falling back to regular screenshot: {cdp_err}")
                # Fallback: use regular screenshot with the resized window
                ok = driver.save_screenshot(str(save_path))
                if not ok:
                    raise RuntimeError("save_screenshot returned False.")

        elif browser_name == "firefox":
            # Firefox supports full-page screenshot natively
            driver.set_window_size(total_width, total_height)
            time.sleep(0.3)
            driver.save_full_page_screenshot(str(save_path))

        else:
            # Fallback: resize window to full page height and take normal screenshot
            driver.set_window_size(total_width, total_height)
            time.sleep(0.3)
            ok = driver.save_screenshot(str(save_path))
            if not ok:
                raise RuntimeError("save_screenshot returned False.")

        print(f"[✓] Full-page screenshot saved ({browser_name}): {save_path}")

    except Exception as e:
        print(f"[x] {browser_name} failed: {e}")
        raise
    finally:
        if driver:
            driver.quit()


def capture(req: PredictRequestByUrl):
    upload_dir = Path(f"upload_image/{req.user_id}/{req.pair_id}")
    upload_dir.mkdir(parents=True, exist_ok=True)
    base_url = "http://127.0.0.1:8080/static"

    saved_paths = []

    for pair in req.image_list:
        timestamp = int(time.time() * 1000)
        file_name = f"{pair.os}_{pair.browser}_{timestamp}.png"
        file_path = upload_dir / file_name

        try:
            capture_full_page(
                url=req.image_url,
                browser_name=pair.browser,
                save_path=file_path
            )

            file_url = f"{base_url}/{req.user_id}/{req.pair_id}/{file_name}"

            saved_path = savedPairPaths(
                pair_id=req.pair_id,
                image_name=file_name,
                image_url=file_url,
                browser=pair.browser,
                os=pair.os,
                image_path=file_path.as_posix()
            )

            saved_paths.append(saved_path)

        except Exception as e:
            print(f"Error capturing screenshot for URL {req.image_url} "
                  f"with browser {pair.browser}: {e}")

    return saved_paths


# import platform
# import time
# from pathlib import Path

# from selenium import webdriver
# from selenium.common.exceptions import WebDriverException

# from selenium.webdriver.chrome.service import Service as ChromeService
# from selenium.webdriver.chrome.options import Options as ChromeOptions

# from selenium.webdriver.firefox.service import Service as FirefoxService
# from selenium.webdriver.firefox.options import Options as FirefoxOptions

# from selenium.webdriver.edge.options import Options as EdgeOptions

# from selenium.webdriver.support.ui import WebDriverWait

# from webdriver_manager.chrome import ChromeDriverManager
# from webdriver_manager.firefox import GeckoDriverManager
# # removed EdgeChromiumDriverManager import (no longer needed)

# from app.modal import PredictRequestByUrl, savedPairPaths


# def _base_headless_args(options, browser: str):
#     """
#     Shared stable args for Chromium-based headless (Chrome/Edge).
#     """
#     options.add_argument("--headless=new")
#     options.add_argument("--disable-gpu")
#     options.add_argument("--no-sandbox")
#     options.add_argument("--disable-dev-shm-usage")
#     options.add_argument("--disable-features=NetworkService,NetworkServiceInProcess")
#     options.add_argument("--hide-scrollbars")
#     options.add_argument("--force-device-scale-factor=1")
#     options.add_argument("--window-size=1920,1080")

#     options.add_argument("--lang=en-US")
#     options.add_argument(
#         "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
#         "AppleWebKit/537.36 (KHTML, like Gecko) "
#         "Chrome/120.0.0.0 Safari/537.36"
#     )


# def get_driver(browser_name: str):
#     browser_name = (browser_name or "").lower().strip()

#     if browser_name == "chrome":
#         options = ChromeOptions()
#         _base_headless_args(options, "chrome")
#         return webdriver.Chrome(
#             service=ChromeService(ChromeDriverManager().install()),
#             options=options
#         )

#     if browser_name == "firefox":
#         options = FirefoxOptions()
#         options.add_argument("-headless")
#         try:
#             return webdriver.Firefox(
#                 service=FirefoxService(GeckoDriverManager().install()),
#                 options=options
#             )
#         except WebDriverException as e:
#             if "Expected browser binary location" in str(e) or "Unable to find" in str(e):
#                 raise RuntimeError(
#                     "Firefox binary not found. Install Firefox or set binary path via FirefoxOptions().binary_location."
#                 ) from e
#             raise

#     if browser_name == "edge": 
#         # ✅ FIX: Use Selenium Manager instead of webdriver_manager for Edge
#         # This prevents the “Could not reach host” download error.
#         options = EdgeOptions()
#         options.use_chromium = True
#         _base_headless_args(options, "edge")

#         # Optional automation flags (keep if you want)
#         options.add_experimental_option("excludeSwitches", ["enable-automation"])
#         options.add_experimental_option("useAutomationExtension", False)

#         # ✅ KEY CHANGE: no EdgeService + no EdgeChromiumDriverManager()
#         return webdriver.Edge(options=options) 

#     if browser_name == "safari":
#         if platform.system().lower() != "darwin":
#             raise ValueError("Safari is only supported on macOS")
#         return webdriver.Safari()

#     raise ValueError(f"Browser '{browser_name}' not supported on {platform.system()}")


# def capture_full_page(url: str, browser_name: str, save_path: Path):
#     browser_name = (browser_name or "").lower().strip()

#     if browser_name == "safari" and platform.system().lower() != "darwin":
#         raise ValueError("Safari is only supported on macOS")

#     driver = None
#     try:
#         driver = get_driver(browser_name)
#         driver.get(url)

#         WebDriverWait(driver, 15).until(
#             lambda d: d.execute_script("return document.readyState") == "complete"
#         )

#         time.sleep(0.7)

#         total_width = 1920
#         total_height = 1080

#         driver.set_window_size(total_width, total_height)
#         time.sleep(0.3)

#         ok = driver.save_screenshot(str(save_path))
#         if not ok:
#             raise RuntimeError("save_screenshot returned False (screenshot not written).")

#         print(f"[✓] Screenshot saved ({browser_name}): {save_path}")

#     except Exception as e:
#         print(f"[x] {browser_name} failed: {e}")
#         raise
#     finally:
#         if driver:
#             driver.quit()


# def capture(req: PredictRequestByUrl):
#     upload_dir = Path(f"upload_image/{req.user_id}/{req.pair_id}")
#     upload_dir.mkdir(parents=True, exist_ok=True)
#     base_url = "http://127.0.0.1:8080/static"

#     saved_paths = []

#     for pair in req.image_list:
#         timestamp = int(time.time() * 1000)
#         file_name = f"{pair.os}_{pair.browser}_{timestamp}.png"
#         file_path = upload_dir / file_name

#         try:
#             capture_full_page(
#                 url=req.image_url,
#                 browser_name=pair.browser,
#                 save_path=file_path
#             )

#             file_url = f"{base_url}/{req.user_id}/{req.pair_id}/{file_name}"

#             saved_path = savedPairPaths(
#                 pair_id=req.pair_id,
#                 image_name=file_name,
#                 image_url=file_url,
#                 browser=pair.browser,
#                 os=pair.os,
#                 image_path=file_path.as_posix()
#             )

#             saved_paths.append(saved_path)

#         except Exception as e:
#             print(f"Error capturing screenshot for URL {req.image_url} with browser {pair.browser}: {e}")

#     return saved_paths
