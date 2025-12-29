package com.jaimin.justStore;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class JustStoreApplication {

	public static void main(String[] args) {
		SpringApplication.run(JustStoreApplication.class, args);
	}

}
