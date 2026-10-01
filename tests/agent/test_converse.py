# Copyright 2026 LingualDub Authors.
# SPDX-License-Identifier: Apache-2.0

from lingualdub.agent.converse import (
    BargeInController,
    ConversationalVoiceAgent,
    ConversationTurn,
)


def test_barge_in_controller_lifecycle():
    ctrl = BargeInController()
    assert not ctrl.is_agent_speaking
    assert not ctrl.is_interrupted

    ctrl.start_speaking()
    assert ctrl.is_agent_speaking
    assert not ctrl.is_interrupted

    # Interrupt while speaking
    interrupted = ctrl.interrupt()
    assert interrupted is True
    assert not ctrl.is_agent_speaking
    assert ctrl.is_interrupted

    # Second interrupt when already stopped
    interrupted_again = ctrl.interrupt()
    assert interrupted_again is False

    # Reset
    ctrl.reset()
    assert not ctrl.is_interrupted
    assert not ctrl.is_agent_speaking


def test_barge_in_controller_stop_speaking():
    ctrl = BargeInController()
    ctrl.start_speaking()
    ctrl.stop_speaking()
    assert not ctrl.is_agent_speaking
    assert not ctrl.is_interrupted


def test_conversation_turn():
    turn = ConversationTurn(role="user", text="Wasuze otya?")
    assert turn.role == "user"
    assert turn.text == "Wasuze otya?"
    assert turn.audio_path is None
    assert turn.timestamp > 0
    assert turn.metadata == {}


def test_agent_default_responder():
    agent = ConversationalVoiceAgent()
    # Greeting in Luganda
    resp_lug = agent._default_responder("Oli otya ssebo?", [])
    assert "Gyendi bulungi" in resp_lug

    # Greeting in Swahili
    resp_swa = agent._default_responder("Hujambo kaka?", [])
    assert "Gyendi bulungi" in resp_swa

    # General query
    resp_gen = agent._default_responder("Njagala omusawo", [])
    assert "Ntegedde bulungi: Njagala omusawo" in resp_gen


def test_agent_respond_stream_full():
    agent = ConversationalVoiceAgent(voice_id="kigozi_lug", language="lug")
    chunks = list(agent.respond_stream(user_text="Oli otya?"))

    assert len(chunks) > 0
    assert chunks[-1].is_final is True
    assert len(agent.history) == 2
    assert agent.history[0].role == "user"
    assert agent.history[0].text == "Oli otya?"
    assert agent.history[1].role == "assistant"
    assert "Gyendi bulungi" in agent.history[1].text


def test_agent_respond_stream_interruption():
    agent = ConversationalVoiceAgent(voice_id="kigozi_lug", language="lug")

    # Custom multi-sentence reply to ensure multiple chunks
    agent.llm_responder = lambda text, hist: "Sentensi ya kwanza. Sentensi ya pili. Sentensi ya tatu."

    yielded_chunks = []
    stream = agent.respond_stream(user_text="Habari")
    for chunk in stream:
        yielded_chunks.append(chunk)
        # Barge in immediately after first chunk
        agent.barge_in.interrupt()

    # Stream should have terminated early before delivering all 3 sentences
    assert len(yielded_chunks) < 3


def test_agent_custom_responder():
    def custom_llm(text: str, history: list) -> str:
        return f"Echo: {text}"

    agent = ConversationalVoiceAgent(llm_responder=custom_llm)
    chunks = list(agent.respond_stream(user_text="Testing echo"))
    assert len(chunks) > 0
    assert agent.history[-1].text == "Echo: Testing echo"
