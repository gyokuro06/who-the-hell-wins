import com.microsoft.playwright.Locator
import com.microsoft.playwright.options.WaitForSelectorState
import com.thoughtworks.gauge.Step
import kotlin.test.assertEquals

class StepImplementation {
    @Step("ホームを開く")
    fun openHome() {
        page.navigate(config.sut.url.toString())
        page.waitForSelector("[data-testid='board-section']")
    }

    @Step("ボードには5枚のカードが表示される")
    fun boardHasFiveCards() {
        val count = page.locator("[data-testid^='board-card-']").count()
        assertEquals(5, count, "board card count")
    }

    @Step("10人のプレイヤーがそれぞれ2枚のカードを表示する")
    fun playersHaveTwoCardsEach() {
        val players = page.locator("[data-testid^='player-']")
        val playerCount = players.count()
        assertEquals(10, playerCount, "player count")

        repeat(playerCount) { idx ->
            val holeCards = players.nth(idx).locator("[data-testid^='hole-card-']")
            assertEquals(2, holeCards.count(), "player ${idx + 1} hole card count")
        }
    }

    @Step("プレイヤー1を選択する")
    fun selectPlayer1() {
        page.locator("[data-testid='player-1']").click()
    }

    @Step("選択されているプレイヤーは1人のみ")
    fun onlyOnePlayerIsSelected() {
        val selected = page.locator("[data-testid^='player-'][data-selected='true']").count()
        assertEquals(1, selected, "selected player count")
    }

    @Step("選択表示はプレイヤー1になっている")
    fun selectedSeatIsPlayer1() {
        val count = page.locator("[data-testid='player-1'][data-selected='true']").count()
        assertEquals(1, count, "player 1 should be marked selected")
    }
}
