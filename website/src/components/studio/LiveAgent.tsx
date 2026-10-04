import React from 'react';
import AgentHeaderBanner from './agent/AgentHeaderBanner';
import AgentDialectBar from './agent/AgentDialectBar';
import AgentTranscriptView from './agent/AgentTranscriptView';
import AgentPromptStarters from './agent/AgentPromptStarters';
import AgentInputDock from './agent/AgentInputDock';
import { useAgentConversation } from './agent/useAgentConversation';

export default function LiveAgent() {
  const {
    selectedLang,
    chatHistory,
    chatInput,
    setChatInput,
    agentSpeaking,
    isInferring,
    bargeInTriggered,
    isListening,
    latencyMs,
    toggleMic,
    handleBargeIn,
    handleSendChatMessage,
    handleReplayAudio,
    handleSelectLang,
    handleResetSession,
    handleExportTranscript,
  } = useAgentConversation();

  return (
    <div
      className="space-y-8 max-w-5xl mx-auto page-fade-in"
      role="region"
      aria-label="Conversational Voice Agent"
    >
      <AgentHeaderBanner
        latencyMs={latencyMs}
        agentSpeaking={agentSpeaking}
        isInferring={isInferring}
        isListening={isListening}
        bargeInTriggered={bargeInTriggered}
      />

      <AgentDialectBar
        selectedLang={selectedLang}
        onSelectLang={handleSelectLang}
        onExportTranscript={handleExportTranscript}
        onResetSession={handleResetSession}
      />

      <div className="bg-[#101726] rounded-3xl p-7 sm:p-9 shadow-xl space-y-6">
        <AgentTranscriptView
          chatHistory={chatHistory}
          isInferring={isInferring}
          onReplayAudio={handleReplayAudio}
        />

        <AgentPromptStarters
          selectedLang={selectedLang}
          onSelectStarter={(text) => setChatInput(text)}
        />

        <AgentInputDock
          input={chatInput}
          onInputChange={setChatInput}
          onSendMessage={handleSendChatMessage}
          isInferring={isInferring}
          isListening={isListening}
          onToggleMic={toggleMic}
          agentSpeaking={agentSpeaking}
          onBargeIn={handleBargeIn}
          selectedLang={selectedLang}
        />
      </div>
    </div>
  );
}
