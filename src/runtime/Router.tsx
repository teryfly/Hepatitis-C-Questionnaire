import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { HomePage } from "../pages/HomePage";
import { QuestionnairePage } from "../pages/QuestionnairePage";

export const Router: React.FC = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/questionnaire/:programType/:programId?" element={<QuestionnairePage />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);