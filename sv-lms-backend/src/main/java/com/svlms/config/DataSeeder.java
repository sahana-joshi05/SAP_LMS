package com.svlms.config;

import com.svlms.entity.*;
import com.svlms.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final String DEMO_PASSWORD = "Password@123";

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final BatchRepository batchRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, CourseRepository courseRepository,
                       BatchRepository batchRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.batchRepository = batchRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        User superAdmin = upsertUser("Institute Super Admin", "superadmin@sapinstitute.com", User.Role.SUPERADMIN);
        upsertUser("Meera Admin", "admin@sapinstitute.com", User.Role.ADMIN);
        upsertUser("Priya Counselor", "counselor@sapinstitute.com", User.Role.COUNSELOR);
        upsertUser("Ravi Operations", "operations@sapinstitute.com", User.Role.OPERATIONS);
        upsertUser("Neha SEO", "seo@sapinstitute.com", User.Role.SEO);
        User trainer = upsertUser("Anand Trainer", "trainer@sapinstitute.com", User.Role.TRAINER);

        Course course = courseRepository.findAll().stream()
                .filter(c -> "SAP-FICO".equals(c.getCode()))
                .findFirst()
                .orElseGet(() -> {
                    Course c = new Course();
                    c.setName("SAP FICO");
                    c.setCode("SAP-FICO");
                    c.setDescription("SAP Financial Accounting and Controlling");
                    c.setDuration("3 months");
                    c.setFee(45000.0);
                    return courseRepository.save(c);
                });

        boolean batchExists = batchRepository.findAll().stream()
                .anyMatch(b -> "FICO-Morning-Batch-1".equals(b.getBatchName()));
        if (!batchExists) {
            Batch batch = new Batch();
            batch.setCourse(course);
            batch.setTrainer(trainer);
            batch.setBatchName("FICO-Morning-Batch-1");
            batch.setStartDate(java.time.LocalDate.now());
            batch.setMode(Batch.Mode.online);
            batch.setTiming("8:00 AM - 10:00 AM");
            batch.setStatus(Batch.Status.ongoing);
            batchRepository.save(batch);
        }

        System.out.println("\n=== SV LMS demo data ready ===");
        System.out.println("Password for all demo accounts: " + DEMO_PASSWORD);
        System.out.println("  Super Admin : superadmin@sapinstitute.com");
        System.out.println("  Admin       : admin@sapinstitute.com");
        System.out.println("  Counselor   : counselor@sapinstitute.com");
        System.out.println("  Operations  : operations@sapinstitute.com");
        System.out.println("  SEO         : seo@sapinstitute.com");
        System.out.println("  Instructor  : trainer@sapinstitute.com");
        System.out.println("Students are created by converting a Lead as the Counselor.\n");
    }

    private User upsertUser(String name, String email, User.Role role) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            User u = new User();
            u.setName(name);
            u.setEmail(email);
            u.setPasswordHash(passwordEncoder.encode(DEMO_PASSWORD));
            u.setRole(role);
            return userRepository.save(u);
        });
    }
}
