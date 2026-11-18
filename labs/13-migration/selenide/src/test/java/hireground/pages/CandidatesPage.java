package hireground.pages;

import static com.codeborne.selenide.Condition.exactText;
import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.$$;
import static com.codeborne.selenide.Selenide.$x;
import static com.codeborne.selenide.Selenide.sleep;

import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.SelenideElement;

public class CandidatesPage {

    public CandidatesPage open() {
        Selenide.open("/recruiter/candidates");
        return this;
    }

    public CandidatesPage search(String text) {
        $("#candidate-search").setValue(text);
        sleep(1000); // the table reloads 300 ms after the last key
        return this;
    }

    /** The table row of a candidate, found by the text of the link in its second cell. */
    public SelenideElement row(String name) {
        return $x("//table[contains(@class,'candidates')]//tr[td[2]/a[text()='" + name + "']]");
    }

    public void moveTo(String name, String stage) {
        row(name).$(".hg-select__trigger").click();
        $$(".hg-select__option").findBy(exactText(stage)).click();
    }

    public SelenideElement toast() {
        return $(".toast-item");
    }
}
