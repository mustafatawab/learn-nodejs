import type { TodoCreateInput, TodoUpdateInput } from "./todo.schema.js";
export declare const createTodo: (input: TodoCreateInput, userId: string) => Promise<any>;
export declare const getTodos: (userId: string) => Promise<any>;
export declare const getSingleTodo: (id: string, userId: string) => Promise<any>;
export declare const updateTodo: (id: string, userId: string, input: TodoUpdateInput) => Promise<any>;
export declare const deleteTodo: (id: string, userId: string) => Promise<any>;
//# sourceMappingURL=todo.service.d.ts.map