package hireground;

import static com.codeborne.selenide.Condition.text;
import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selectors.byText;
import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.$$;
import static com.codeborne.selenide.Selenide.open;
import static com.codeborne.selenide.Selenide.sleep;

import hireground.pages.CandidatesPage;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;

/**
 * One candidate, from the application to the interview.
 * Three tests, and each one needs the one before it.
 */
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class CandidatePipelineTest extends BaseTest {

    // The same candidate in every run. The test environment is restored from a dump every night.
    private static final String FIRST_NAME = "Selma";
    private static final String LAST_NAME = "Selenide";
    private static final String EMAIL = "selma.selenide@example.com";

    private static String reference; // written by test 1, read by test 3

    @Test
    @Order(1)
    void candidateApplies() {
        open("/jobs/backend-developer-java/apply");
        $("#firstName").setValue(FIRST_NAME);
        $("#lastName").setValue(LAST_NAME);
        $("#email").setValue(EMAIL);
        $("#cv").uploadFromClasspath("cv.pdf");
        $("#consent").setSelected(true);
        $(byText("Submit application")).click();
        sleep(3000); // the confirmation page needs a moment
        $("h1").shouldHave(text("Thank you for applying"));
        reference = $("[data-testid='application-reference']").getText();
    }

    @Test
    @Order(2)
    void recruiterMovesTheCandidateToInterview() {
        loginAsRecruiter();
        CandidatesPage candidates = new CandidatesPage().open().search(LAST_NAME);
        candidates.row(FIRST_NAME + " " + LAST_NAME).shouldBe(visible);
        candidates.moveTo(FIRST_NAME + " " + LAST_NAME, "Interview");
        candidates.toast().shouldHave(text("moved to Interview"));
    }

    @Test
    @Order(3)
    void candidateHearsAboutIt() {
        open("/status/" + reference);
        $("dl.facts").shouldHave(text("We would like to meet you."));

        sleep(3000); // the mail is sent by a queue
        open("/mailbox");
        $$(".mails .subject").findBy(text("Status update: Backend Developer (Java)")).shouldBe(visible);
    }
}
