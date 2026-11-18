package hireground.pages;

import static com.codeborne.selenide.Condition.text;
import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.$x;

import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.SelenideElement;

public class LoginPage {

    private final SelenideElement email = $("#login-email");
    private final SelenideElement password = $("#login-password");
    private final SelenideElement submit = $x("//button[@type='submit']");

    public LoginPage open() {
        Selenide.open("/login");
        return this;
    }

    public void signIn(String user, String pass) {
        email.setValue(user);
        password.setValue(pass);
        submit.click();
        $("h1").shouldHave(text("Pipeline")); // an assertion inside the page object
    }
}
