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

# Browser automation helpers for capturing full-page screenshots from a live URL.

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
        options = ChromeOptions()
        _base_headless_args(options, "chrome")

        # In Linux/Docker, Chromium is typically installed at /usr/bin/chromium
        if platform.system().lower() == "linux":
            options.binary_location = "/usr/bin/chromium"

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
        options = EdgeOptions()
        options.use_chromium = True
        _base_headless_args(options, "edge")

        if platform.system().lower() == "linux":
            options.binary_location = "/usr/bin/chromium"

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

        # Give late layout work a moment to settle before measuring and capturing the page.
        time.sleep(0.7)

        # Measure the full scrollable document so the saved image includes off-screen content.
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
                # Chromium browsers usually give the best full-page result through CDP capture.
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
                # Fall back to a normal screenshot if CDP capture is unavailable in this runtime.
                ok = driver.save_screenshot(str(save_path))
                if not ok:
                    raise RuntimeError("save_screenshot returned False.")

        elif browser_name == "firefox":
            # Firefox exposes its own native full-page screenshot API.
            driver.set_window_size(total_width, total_height)
            time.sleep(0.3)
            driver.save_full_page_screenshot(str(save_path))

        else:
            # Non-Chromium fallback still benefits from resizing to the full document first.
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
    # Relative static URLs work both in local development and behind a reverse proxy.
    base_url = "/static"

    saved_paths = []
    errors = []

    for pair in req.image_list:
        timestamp = int(time.time() * 1000)
        file_name = f"{pair.os}_{pair.browser}_{timestamp}.png"
        file_path = upload_dir / file_name

        try:
            # Save one screenshot per requested browser/OS environment under the current pair folder.
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
            error_msg = (
                f"Error capturing screenshot for URL {req.image_url} "
                f"with browser {pair.browser}: {e}"
            )
            print(error_msg)
            errors.append(error_msg)

    if errors:
        raise RuntimeError(" | ".join(errors))

    return saved_paths

