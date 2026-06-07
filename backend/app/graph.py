from langgraph.graph import StateGraph, END
from typing import TypedDict, Optional
from app.state import AgentState
from app.unified_agent import unified_agent

class GraphState(TypedDict):
    resume: str
    job_description: str
    result: Optional[dict]
    error: Optional[str]

def run_unified_agent(state: GraphState) -> GraphState:
    updated = unified_agent(AgentState(
        resume=state["resume"],
        job_description=state["job_description"]
    ))
    return {
        **state,
        "result": updated.result.model_dump() if updated.result else None,
        "error": updated.error
    }

def build_graph():
    b = StateGraph(GraphState)
    b.add_node("unified_agent", run_unified_agent)
    b.set_entry_point("unified_agent")
    b.add_edge("unified_agent", END)
    return b.compile()

job_graph = build_graph()
