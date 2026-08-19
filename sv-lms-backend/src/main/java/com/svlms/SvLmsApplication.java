package com.svlms;

import java.net.URI;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SvLmsApplication {
    public static void main(String[] args) {
        configureRenderPostgresUrl();
        SpringApplication.run(SvLmsApplication.class, args);
    }

    private static void configureRenderPostgresUrl() {
        String databaseUrl = System.getenv("DB_URL");
        if (databaseUrl == null || databaseUrl.isBlank()) {
            databaseUrl = System.getenv("DATABASE_URL");
        }

        if (databaseUrl == null || databaseUrl.isBlank()
                || !(databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://"))) {
            return;
        }

        URI uri = URI.create(databaseUrl);
        String jdbcUrl = "jdbc:postgresql://" + uri.getHost()
                + (uri.getPort() > 0 ? ":" + uri.getPort() : "")
                + uri.getPath();

        System.setProperty("spring.datasource.url", jdbcUrl);
        if (System.getenv("DB_USERNAME") == null && uri.getUserInfo() != null) {
            String[] userInfo = uri.getUserInfo().split(":", 2);
            System.setProperty("spring.datasource.username", userInfo[0]);
            if (userInfo.length > 1) {
                System.setProperty("spring.datasource.password", userInfo[1]);
            }
        }
    }
}
