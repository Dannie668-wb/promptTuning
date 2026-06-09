import { createContext, useContext, useReducer, useEffect } from 'react'
import type { PageBundle, A2UIComponent } from '../types/schema'
import formPage from '../examples/form-page.json'

interface EditorState {
  bundle: PageBundle
  selectedId: string | null
}

type EditorAction =
  | { type: 'SELECT'; id: string | null }
  | { type: 'ADD_COMPONENT'; node: Omit<A2UIComponent, 'id'>; parentId?: string }
  | { type: 'DELETE_COMPONENT'; id: string }
  | { type: 'UPDATE_NODE'; id: string; fields: Partial<A2UIComponent> }
  | { type: 'UPDATE_STYLE'; id: string; style: Record<string, string | number> }
  | { type: 'SET_BUNDLE'; bundle: PageBundle }

function generateId(): string {
  return `comp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  const { bundle } = state

  switch (action.type) {
    case 'SELECT':
      return { ...state, selectedId: action.id }

    case 'DELETE_COMPONENT': {
      const { id } = action
      const components = bundle.components
        .filter(c => c.id !== id)
        .map(c =>
          Array.isArray(c.children)
            ? { ...c, children: c.children.filter(childId => childId !== id) }
            : c
        )
      return {
        bundle: { ...bundle, components },
        selectedId: state.selectedId === id ? null : state.selectedId,
      }
    }

    case 'ADD_COMPONENT': {
      const id = generateId()
      const newNode: A2UIComponent = { ...action.node, id }
      const parentId = action.parentId ?? 'root'
      const components = [
        ...bundle.components.map(c =>
          c.id === parentId && Array.isArray(c.children)
            ? { ...c, children: [...c.children, id] }
            : c
        ),
        newNode,
      ]
      return {
        bundle: { ...bundle, components },
        selectedId: id,
      }
    }

    case 'UPDATE_NODE': {
      const { id, fields } = action
      const components = bundle.components.map(c =>
        c.id === id ? { ...c, ...fields } : c
      )
      return { ...state, bundle: { ...bundle, components } }
    }

    case 'UPDATE_STYLE': {
      const { id, style } = action
      const components = bundle.components.map(c =>
        c.id === id
          ? { ...c, style: { ...(c.style as Record<string, unknown>), ...style } }
          : c
      )
      return { ...state, bundle: { ...bundle, components } }
    }

    case 'SET_BUNDLE':
      return { bundle: action.bundle, selectedId: null }

    default:
      return state
  }
}

const EditorContext = createContext<{
  state: EditorState
  dispatch: React.Dispatch<EditorAction>
} | null>(null)

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(editorReducer, {
    bundle: formPage as PageBundle,
    selectedId: null,
  })

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      const id = (e.target as HTMLElement).closest('[data-node-id]')?.getAttribute('data-node-id')
        ?? state.selectedId
      if (id) dispatch({ type: 'DELETE_COMPONENT', id })
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [state.selectedId])

  return <EditorContext.Provider value={{ state, dispatch }}>{children}</EditorContext.Provider>
}

export function useEditor() {
  const ctx = useContext(EditorContext)
  if (!ctx) throw new Error('useEditor must be used within EditorProvider')
  return ctx
}
