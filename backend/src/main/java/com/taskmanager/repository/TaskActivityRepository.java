package com.taskmanager.repository;

import com.taskmanager.model.TaskActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskActivityRepository extends JpaRepository<TaskActivity, Long> {
    List<TaskActivity> findByTaskIdOrderByCreatedAtDesc(Long taskId);
}