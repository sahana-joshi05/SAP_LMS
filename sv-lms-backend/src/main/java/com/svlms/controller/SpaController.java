package com.svlms.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    @GetMapping(value = {
            "/login",
            "/forgot-password",
            "/reset-password",
            "/superadmin",
            "/superadmin/users",
            "/superadmin/courses",
            "/superadmin/batches",
            "/superadmin/reports",
            "/admin",
            "/admin/users",
            "/admin/courses",
            "/admin/batches",
            "/admin/reports",
            "/counselor",
            "/counselor/leads",
            "/counselor/follow-ups",
            "/counselor/admission",
            "/counselor/link-admission",
            "/counselor/receipts",
            "/counselor/reports",
            "/counselor/request-message",
            "/operations",
            "/operations/batches",
            "/operations/students",
            "/operations/support",
            "/seo",
            "/trainer",
            "/trainer/assessments",
            "/student",
            "/student/workspace",
            "/student/support"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
