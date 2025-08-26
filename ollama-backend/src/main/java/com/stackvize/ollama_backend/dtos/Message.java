package com.stackvize.ollama_backend.dtos;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record Message(
    @NotNull Role role,
    @NotEmpty String content
) {
    public enum Role { system, user, assistant }
}
