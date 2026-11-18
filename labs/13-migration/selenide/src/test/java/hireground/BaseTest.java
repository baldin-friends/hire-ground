package hireground;

import static com.codeborne.selenide.Selenide.closeWebDriver;

import com.codeborne.selenide.Configuration;
import hireground.pages.LoginPage;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;

/**
 * Every test class extends this one. The settings are static: one browser, one base URL
 * and one recruiter account for the whole JVM.
 */
public abstract class BaseTest {

    protected static final String RECRUITER = "rita.recruiter@hireground.test";
    protected static final String PASSWORD = "hire-ground";

    @BeforeAll
    static void configure() {
        Configuration.baseUrl = System.getProperty("baseUrl", "http://localhost:3000");
        Configuration.browser = "chrome";
        Configuration.browserSize = "1366x768";
        Configuration.headless = true;
        Configuration.timeout = 8000; // every should…() waits up to 8 s; the default is 4 s
        Configuration.remote = System.getProperty("selenoid"); // not set on a laptop, the grid in CI
    }

    @AfterAll
    static void closeBrowser() {
        closeWebDriver();
    }

    /** Signs in through the form. Every recruiter test starts with it. */
    protected void loginAsRecruiter() {
        new LoginPage().open().signIn(RECRUITER, PASSWORD);
    }
}
