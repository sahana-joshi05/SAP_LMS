package com.svlms.util;

import java.security.SecureRandom;

public final class PasswordUtil {

    private static final String DEFAULT_TEMP_PASSWORD = "Student@123";
    private static final String CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$";
    private static final SecureRandom RANDOM = new SecureRandom();

    private PasswordUtil() {}

    /** Default temporary password assigned when converting a Lead to a Student. */
    public static String defaultTempPassword() {
        return DEFAULT_TEMP_PASSWORD;
    }

    /** Generates a random password, useful if you want unique temp passwords instead of a fixed default. */
    public static String generateRandom(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(CHARS.charAt(RANDOM.nextInt(CHARS.length())));
        }
        return sb.toString();
    }
}
