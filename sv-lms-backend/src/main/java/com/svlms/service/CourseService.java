package com.svlms.service;

import com.svlms.dto.request.CreateCourseRequest;
import com.svlms.entity.Course;
import com.svlms.exception.BadRequestException;
import com.svlms.repository.CourseRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseService {

    private final CourseRepository courseRepository;

    public CourseService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    public Course create(CreateCourseRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new BadRequestException("Course name is required");
        }
        Course course = new Course();
        course.setName(request.getName());
        course.setCode(request.getCode());
        course.setDescription(request.getDescription());
        course.setDuration(request.getDuration());
        course.setFee(request.getFee() != null ? request.getFee() : 0.0);
        return courseRepository.save(course);
    }

    public List<Course> list() {
        return courseRepository.findAllByOrderByCreatedAtDesc();
    }
}
