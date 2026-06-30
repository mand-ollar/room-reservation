# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.
- Don't dump everything into one file. Split by responsibility.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Python

### Type Annotations

Always explicit. No exceptions — parameters, return types, variable assignments.
Use Python 3.10+ built-in generics (`list`, `dict`, `tuple`, `str | None`). Never import from `typing` for these.

```python
# correct
def get_users(limit: int = 20) -> list[User]:
    results: list[User] = db.query(limit=limit)
    return results

# never
def get_users(limit=20):
    results = db.query(limit)
    return results
```

### Keyword Arguments

Always use keyword arguments when calling custom functions and methods. Builtins like `len()`, `str()`, `print()`, `isinstance()` are exempt.

```python
# correct
user = get_user(user_id=123)
response = client.post(url="/api", json=payload)

# never
user = get_user(123)
response = client.post("/api", payload)
```

### Tooling

- **Package manager:** `uv` — use `uv add`, `uv run`. Never `pip install`. When starting a new project, always install `ruff` and `mypy` as dev dependencies: `uv add --dev ruff mypy`.
- **Linting/Formatting:** `ruff check --fix && ruff format` — config in `pyproject.toml`:
  ```toml
  [tool.ruff]
  line-length = 120

  [tool.ruff.lint]
  select = ["E", "F", "I"]
  ```
- **Type checking:** `mypy .` — strict mode.

### FastAPI

Variable annotations always explicit. Route handlers don't use return type — use `response_model` instead.

```python
# correct
router: APIRouter = APIRouter()

@router.get("/users", response_model=list[User])
def get_users(limit: int = 20, offset: int = 0):
    ...

# never
router = APIRouter()

@router.get("/users")
def get_users(...) -> list[User]:
    ...
```

## 5. TypeScript

### Types

`any` is banned. Use `unknown` and narrow. Prefer `type` over `interface`.

```typescript
// correct
type UserProps = {
  name: string;
  age: number;
};

// never
interface UserProps { ... }
```

### Functions

Exported functions use `function` declaration. Internal functions use `const` arrow.

```typescript
// exported
export function getUser(userId: string): User { ... }

// internal
const formatName = (name: string): string => { ... }
```

### HTTP

Use `fetch` directly. No axios.

### Tooling

- **Package manager:** `pnpm`. Never `npm install`.