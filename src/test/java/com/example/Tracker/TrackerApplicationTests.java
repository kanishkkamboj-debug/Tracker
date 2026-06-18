package com.example.Tracker;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "jwt.secret=testSecretKeyThatIsAtLeast32CharactersLongForTesting",
    "jwt.expiration=3600000"
})
class TrackerApplicationTests {

    @Test
    void contextLoads() {
        // Basic smoke test — just ensures Spring context starts
    }
}
