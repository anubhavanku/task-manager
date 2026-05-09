package com.taskmanager.repository;

import com.taskmanager.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProjectIdOrderByStatusAscPositionAsc(Long projectId);
    List<Task> findByAssigneeIdOrderByDueDateAsc(Long assigneeId);
    List<Task> findByProjectIdAndStatus(Long projectId, Task.Status status);
}