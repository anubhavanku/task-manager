package com.taskmanager.service;

import com.taskmanager.dto.WebSocketMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    public void sendToProject(Long projectId, String type, Object payload, String actor) {
        WebSocketMessage message = new WebSocketMessage(type, payload, actor, projectId);
        messagingTemplate.convertAndSend("/topic/project/" + projectId, message);
    }
}