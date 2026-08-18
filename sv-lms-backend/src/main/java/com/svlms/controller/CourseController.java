package com.svlms.controller;

import com.svlms.dto.request.CreateCourseRequest;
import com.svlms.entity.Course;
import com.svlms.service.CourseService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN')")
    public Course create(@RequestBody CreateCourseRequest request) {
        return courseService.create(request);
    }

    @GetMapping
    public List<Course> list() {
        return courseService.list();
    }
}
