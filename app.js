const cl = console.log

const todoform = document.getElementById('todoform')
const todoInput = document.getElementById('todoInput')
const addbtn = document.getElementById('addbtn')
const updatebtn = document.getElementById('updatebtn')
const todocontainer = document.getElementById('todocontainer')
const todoselect = document.getElementById('todoselect')
const spinner = document.getElementById('spinner')


const Base_Url = `https://crud-dfd04-default-rtdb.firebaseio.com/`
const todo_Url = `${Base_Url}todos.json`

const state = {
    todosArr : [],
    edit_todoId : null,
}

function objToArr(obj){
    for(const key in obj){
        obj[key].id = key;
        state.todosArr.unshift(obj[key])
    }
}

function handleSpinner(flag){
    if(flag){
        spinner.classList.remove('d-none')
    }else{
        spinner.classList.add('d-none')
    }
}

function snackBar(msg,icon){
    Swal.fire({
        title:msg,
        timer:3000,
        icon:icon,
    })
}

function makeApicall(url,methodName,body=null){
    return fetch (url,{
        method:methodName,
        headers: {
            "content-type":"application/json",
            "auth":"JWT token"
        },
        body:body ? JSON.stringify(body) : null
    })
    .then(res =>{
        if(!res.ok){
            throw new Error()
        }
        return res.json()
    })
}

//read 
function oncreate(){
    handleSpinner(true)
    makeApicall(todo_Url,"GET")
     .then(data=>{
        cl(data)
        objToArr(data)
        templiting(state.todosArr)
     })
     .catch(err=>{
        snackBar("Error...!")
     })
     .finally(()=>{
        handleSpinner()
     })

}


//templiting
function templiting(arr){
    let result =``
    arr.forEach((todo)=>{
        result += `<li id="${todo.id}" class="list-group-item d-flex justify-content-between">
                    <strong>${todo.todoItem}</strong>
                    <div>
                        <button onclick="onedit(this)" class="btn btn-sm btn-primary">Edit</button>
                        <button onclick="ondelete(this)" class="btn btn-sm btn-danger">Delete</button>
                    </div>
                </li>`
    })
    todocontainer.innerHTML = result;
}
oncreate()

//create.....!

function onAddTodo(eve){
    eve.preventDefault()
    let new_obj = {
        todoItem : todoInput.value
    }
    handleSpinner(true)
    makeApicall(todo_Url,"POST",new_obj)
      .then(res=>{
        cl(res)
        new_obj.id = res.name
        state.todosArr.unshift(new_obj)
        templiting(state.todosArr)
        todoform.reset()
        snackBar("New Todo Added Successfully !!!!","success")
      })
      .catch(err =>{
        cl(err);
        snackBar("something went wrong","error")
      })
      .finally(()=>{
        handleSpinner()
      });

}

// edit....!

function onedit(ele){
   let editId = ele.closest('li').id
   state.edit_todoId = editId
   let editObj = state.todosArr.find(t => t.id === editId)

   todoInput.value = editObj.todoItem

   addbtn.classList.add("d-none")
   updatebtn.classList.remove("d-none")

}

//update....!

function onupdatetodo(eve){
    let updateId = state.edit_todoId;
    let updateUrl = `${Base_Url}todos/${updateId}.json`
    let old_obj =  state.todosArr.find(t=> t.id === state.edit_todoId)
    let updatedObj = {
        todoItem : todoInput.value,
        id:updateId
    }
     handleSpinner(true)
     makeApicall(updateUrl,"PATCH",updatedObj)
      .then(res => {
        let getIndex = state.todosArr.findIndex(t=> t.id === updateId)
        state.edit_todoId = null;
        state.todosArr[getIndex] = updatedObj ;
       templiting(state.todosArr)
       todoform.reset()
       addbtn.classList.remove('d-none')
       updatebtn.classList.add('d-none')
       snackBar("Todo Upadated Successfully !!!",'success')
      })
      .catch(err => {
        cl(err);
        snackBar("something went wrong !",'error')
      })
      .finally(()=>{
        handleSpinner()
      })
}

//delete...!!!

function ondelete(ele){
    let removeId = ele.closest('li').id
    
    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!"
        }).then((result) => {
        if (result.isConfirmed) {
            handleSpinner(true)
        let removeUrl = `${Base_Url}todos/${removeId}.json`;
        makeApicall(removeUrl,"DELETE")
         .then(res=>{
            let getIndex = state.todosArr.findIndex(t => t.id === removeId)
            state.todosArr.splice(getIndex,1)
            ele.closest('li').remove()
            snackBar(` Todo is Deleted Successfully !!!`,'success')
         })
         .catch(err=>{
            snackBar(err,'error')
         })
         .finally(()=>{
            handleSpinner()
         })
        }
    });

}


todoform.addEventListener("submit",onAddTodo)
updatebtn.addEventListener("click",onupdatetodo)