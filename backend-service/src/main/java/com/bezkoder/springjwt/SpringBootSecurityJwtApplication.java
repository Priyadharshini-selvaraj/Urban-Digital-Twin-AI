package com.bezkoder.springjwt;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Urban Digital Twin AI — Spring Boot Application Entry Point
 * @EnableScheduling placed here (application level) not inside @Component classes.
 */
@SpringBootApplication
@EnableScheduling
public class SpringBootSecurityJwtApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpringBootSecurityJwtApplication.class, args);
    }
}
