import { Component } from '@angular/core';
//import { FormsModule } from '@angular/forms';

class Todo {
  constructor(
      public title: string,
      public completed: boolean = false,
      public editing: boolean = false
    ) {}
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private storeName: string = 'myTodos';
  private newTodoTitle: string = '';
  private todos: Array<Todo>;
  
  public constructor() {
    this.todos = this.loadTodos();
  }
  
  public add() : void {
    this.todos.push( new Todo(this.newTodoTitle) );
    this.newTodoTitle = '';
    this.saveTodos();
  }
  
  public toggle(todo: Todo) : void {
    todo.completed = !todo.completed;
    this.saveTodos();
  }
  
  public togleAll(event: Event) : void {
    event.preventDefault();
    
    let haveUncompletedTodos: boolean = this.todos.some(todo => !todo.completed);
    this.todos.forEach(todo => todo.completed = haveUncompletedTodos);
    
    this.saveTodos();
  }
  
  public removeCompleted(event: Event) : void {
    event.preventDefault();
    this.todos = this.todos.filter(todo => !todo.completed);
    this.saveTodos();
  }

  public showEditing(todo: Todo, input?: HTMLInputElement, event?: Event) : void {
      todo.editing = true;

      if (input) {
          input.value = todo.title;
          setTimeout( () => input.focus());
      }

      if (event) {
          event.preventDefault();
      }
  }

  public removeTask(todo: Todo) : void {
      let index: number = this.todos.indexOf(todo);
      this.todos.splice(index, 1);
      this.saveTodos();
  }

  public saveEditing(todo: Todo, newTitle: string) : void {
      if (!todo.editing) {
          return;
      }

      newTitle = newTitle.trim();
      if (newTitle.length == 0) {
          let index: number = this.todos.indexOf(todo);
          this.todos.splice(index, 1);
          this.saveTodos();
      } else {
          todo.title = newTitle;
          todo.editing = false;
      }
      this.saveTodos();
  }
  
  private loadTodos() : Array<Todo> {
    let data: string = localStorage.getItem(this.storeName) || '[]';
    return JSON.parse( data );
  }
  
  private saveTodos() : void {
    localStorage.setItem(this.storeName, JSON.stringify(this.todos));
  }
}
