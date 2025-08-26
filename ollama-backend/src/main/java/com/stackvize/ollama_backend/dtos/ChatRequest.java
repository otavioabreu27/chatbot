package com.stackvize.ollama_backend.dtos;

import java.util.List;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record ChatRequest(
    @NotNull @NotEmpty List<Message> messages
) {}
