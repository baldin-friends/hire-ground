package hireground;

import static com.codeborne.selenide.CollectionCondition.size;
import static com.codeborne.selenide.CollectionCondition.sizeGreaterThanOrEqual;
import static com.codeborne.selenide.Condition.attribute;
import static com.codeborne.selenide.Condition.exactText;
import static com.codeborne.selenide.Condition.text;
import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selectors.byText;
import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.$$;
import static com.codeborne.selenide.Selenide.open;
import static com.codeborne.selenide.Selenide.webdriver;
import static com.codeborne.selenide.WebDriverConditions.urlContaining;

import org.junit.jupiter.api.Test;

/** A candidate searches for a job, opens it and sends the empty form. */
class JobSearchTest extends BaseTest {

    @Test
    void searchOpensTheJobAndTheForm() {
        open("/jobs");
        $(".job-card").shouldBe(visible); // the list has loaded
        $("#q").setValue("Reliability").pressEnter();
        $$(".job-card").shouldHave(size(1));
        $(".job-card h2").shouldHave(exactText("Site Reliability Engineer"));
        $(".job-card .meta").shouldHave(text("München"));
        $(".job-card .meta").shouldHave(text("remote possible"));

        $(byText("Site Reliability Engineer")).click();
        webdriver().shouldHave(urlContaining("/jobs/site-reliability-engineer"));
        $("h1").shouldHave(exactText("Site Reliability Engineer"));
        $(".salary").shouldHave(text("68.000–86.000 €"));

        $("#apply-button").shouldBe(visible).click();
        $(byText("Submit application")).click();
        $("#email").shouldHave(attribute("aria-invalid", "true"));
        $("#email-error").shouldHave(exactText("Please enter a valid email address."));
        $$(".field-error").shouldHave(sizeGreaterThanOrEqual(4));
    }
}
