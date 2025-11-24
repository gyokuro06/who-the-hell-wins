import com.microsoft.playwright.Browser
import com.microsoft.playwright.BrowserType
import com.microsoft.playwright.Page
import com.microsoft.playwright.Playwright
import com.thoughtworks.gauge.AfterScenario
import com.thoughtworks.gauge.AfterSpec
import com.thoughtworks.gauge.AfterSuite
import com.thoughtworks.gauge.BeforeScenario
import com.thoughtworks.gauge.BeforeSpec
import com.thoughtworks.gauge.BeforeSuite

val page: Page
    get() = _page ?: error("Page is not initialized")
private var _page: Page? = null

class SetupAndTeardown {
    companion object {
        private lateinit var playwright: Playwright
    }
    private lateinit var browser: Browser

    @BeforeSuite
    fun setUpSuite() {
        playwright = Playwright.create()
    }

    @BeforeScenario
    fun setUpScenario() {
        browser = playwright.chromium().launch()
        _page = browser.newPage()
    }

    @AfterScenario
    fun tearDownScenario() {
        browser.close()
    }

    @AfterSuite
    fun tearDownSuite() {
        playwright.close()
    }
}
