// renderer.js

const { ipcRenderer } = require("electron");

const body = document.body;
const noteEntry = document.getElementById("input");
const sup = document.getElementById("sup");
const addBtn = document.getElementById("addBtn");
const notesBox = document.getElementById("notesBox");
const clearBtn = document.getElementById("clearBtn");
const exitBtn = document.getElementById("exitBtn");
const helpBtn = document.getElementById("helpBtn");
const date = document.getElementById("date");
const time = document.getElementById("time");
const themeBtn = document.getElementById("themeBtn");
const themeName = document.getElementById("themeName");

themeName.innerHTML = "n o t i a";
let active = 60
let themeCounter = 0
const themes = ["notia", "megatron", "konoha", "ocean", "mauve"]

setInterval(() => {
  active -= 1;
  if(active >= 1) {
    noteEntry.placeholder = noteEntry.placeholder === "App will close after one minute"? "Welcome Back! Enter a note...": "Enter your note..."
    if(active == 1)
    {
      noteEntry.placeholder = "App will close after one minute"
      setTimeout(() => {
        body.style.animation = "closing 5s"
      }, 55000)
      
    }}
  else {
    ipcRenderer.send("close_app")
  }
}, 60000)

const changeTheme = () => {
  active += 10
  themeCounter++
  if(themeCounter == 5) themeCounter = 0
  document.getElementById("theme").href = themes[themeCounter] + ".css"
  themeName.innerHTML = themes[themeCounter].split("").join(" ")
}

themeBtn.addEventListener("click", () => {
  changeTheme()
})

ipcRenderer.on("change_theme", () => {
  changeTheme()
})

const todayDate = new Date().toLocaleDateString('en-GB', {
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
});

date.innerHTML = `${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()]}, ${todayDate}`

const setTime = () => {
  const now = new Date()
  let hours = now.getHours()
  let minutes = now.getMinutes()
  time.innerHTML = `${hours < 10? '0' + hours : hours}:${minutes < 10? '0' + minutes: minutes}`
}

setTime();
setInterval(() => {
  setTime()
}, 1000)

const styleNoteBody = (note) => {
  let text = ""

  for (let c of note)
  {
    if((c <= "Z" && c >= "A") || (c <= "z" && c >= "a"))
    text += c
    else
    text += "<span class='hlight' >" + c + "</span>"
  }
  
  return text
}

const generateNote = (text) => {
  const note = document.createElement("div");
  note.className = "note";

  const noteBody = document.createElement("p");
  noteBody.className = "body";
  noteBody.innerHTML = styleNoteBody(text);

  const btns = document.createElement("div");
  btns.classList.add("btnGroup", "flex-between");

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("deleteBtn", "btn");
  deleteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="1.25em" viewBox="0 0 448 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/></svg>';
  deleteBtn.title = "delete";

  const editBtn = document.createElement("button");
  editBtn.classList.add("editBtn", "btn");
  editBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="1.25em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160V416c0 53 43 96 96 96H352c53 0 96-43 96-96V320c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H96z"/></svg>';
  editBtn.title = "edit the note";

  btns.appendChild(deleteBtn);
  btns.appendChild(editBtn);
  note.appendChild(noteBody);
  note.appendChild(btns);

  editBtn.addEventListener("click", () => {
    addBtn.innerHTML = "Edit";
    noteEntry.value = text;
    noteEntry.placeholder = text;
    noteEntry.focus();
  });

  deleteBtn.addEventListener("click", () => {
    note.style.animation = "deleteNote .7s";
    setTimeout(() => {
      note.style.display = "none";
    }, 700);
    ipcRenderer.send("delete_note", text);
  });
  
  return note;
};

const load_notes = async (withEffect = true) => {
  notesBox.innerHTML = "";
  const notes = await ipcRenderer.invoke("get_notes");
  notes.forEach(({ content }) => {
    const note = generateNote(content);
    notesBox.appendChild(note);
    if (withEffect) note.style.animation = "create .7s";
  });
};

window.onload = async () => {
  await load_notes();
  setInterval(async () => {
    load_notes(false);
  }, 10000);
};

const addNote = () => {
  active += 5
  if (!noteEntry.value) {
    noteEntry.placeholder = "Empty :)";
    setTimeout(() => {
      noteEntry.placeholder = "Enter your note...";
    }, 3000);
  } else {
    clearBtn.removeAttribute("disabled")
    clearBtn.style.opacity = 1
    if (addBtn.innerHTML === "Add") {
      const note = generateNote(noteEntry.value);
      notesBox.appendChild(note);
      note.style.animation = "create .7s";
      ipcRenderer.send("save_note", noteEntry.value);
      noteEntry.value = "";
      noteEntry.focus();
    } else if (addBtn.innerHTML === "Edit") {
      (async () => {
        ipcRenderer.send("edit_note", noteEntry.placeholder, noteEntry.value);
        noteEntry.placeholder = "Enter your note...";
        noteEntry.value = "";
        addBtn.innerHTML = "Add";
        notesBox.innerHTML = "";
        const notes = await ipcRenderer.invoke("get_notes");
        notes.map(({ content }) => {
          const note = generateNote(content);
          notesBox.appendChild(note);
          note.style.animation = "create .7s";
        });
      })();
    }
  }
}
addBtn.addEventListener("click", () => {
  addNote()
});

noteEntry.addEventListener("keydown", (e) => {
  if(e.keyCode === 13)
  {
    addNote()
  }
})

const clearNotes = () => {
  active += 1
  notesBox.innerHTML = "";
  ipcRenderer.send("clear_notes");
  noteEntry.focus();
  clearBtn.setAttribute("disabled", true)
  clearBtn.style.opacity = 0.5
}
clearBtn.addEventListener("click", () => {
  clearNotes()
});

clearBtn.addEventListener("mouseover", () => {
  active += 1
  notesBox.style.transform = "scale(0.95)";
  setTimeout(() => {
    notesBox.style.transform = "scale(1)";
  }, 500);
  noteEntry.focus();
});

ipcRenderer.on("clear_shortcut", () => {
  clearNotes()
})

exitBtn.addEventListener("mouseover", () => {
  active += 1
  addBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="1.55em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zM174.6 384.1c-4.5 12.5-18.2 18.9-30.7 14.4s-18.9-18.2-14.4-30.7C146.9 319.4 198.9 288 256 288s109.1 31.4 126.6 79.9c4.5 12.5-2 26.2-14.4 30.7s-26.2-2-30.7-14.4C328.2 358.5 297.2 336 256 336s-72.2 22.5-81.4 48.1zM144.4 208a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm192-32a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/></svg>'
  noteEntry.value = "Add one more :(";
  addBtn.style.transform = "rotate(3deg) translateY(100px)";
  notesBox.style.opacity = "0";
  clearBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="1.45em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M464 256c0-114.9-93.1-208-208-208S48 141.1 48 256c0 81.7 47.1 152.4 115.7 186.4c-2.4-8.4-3.7-17.3-3.7-26.4V363.6c-8.9-8-16.7-17.1-23.1-27.1c-10.4-16.1 6.8-32.5 25.5-28.1c28.9 6.8 60.5 10.5 93.6 10.5s64.7-3.7 93.6-10.5c18.7-4.4 35.9 12 25.5 28.1c-6.4 9.9-14.2 19-23 27V416c0 9.2-1.3 18-3.7 26.4C416.9 408.4 464 337.7 464 256zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm176.4-80a32 32 0 1 1 0 64 32 32 0 1 1 0-64zm128 32a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zM320 416V378.6c0-14.7-11.9-26.6-26.6-26.6h-2c-11.3 0-21.1 7.9-23.6 18.9c-2.8 12.6-20.8 12.6-23.6 0c-2.5-11.1-12.3-18.9-23.6-18.9h-2c-14.7 0-26.6 11.9-26.6 26.6V416c0 35.3 28.7 64 64 64s64-28.7 64-64z"/></svg>';
  setTimeout(() => {
    addBtn.innerHTML = "Add";
    noteEntry.value = "";
    addBtn.style.transform = "rotate(0deg) ";
    notesBox.style.opacity = "1";
    clearBtn.innerHTML = "Clear";
  }, 1000);
});

addBtn.addEventListener("mouseover", () =>{
  addBtn.style.transform = "scale(1.05)"
})

addBtn.addEventListener("mouseleave", () =>{
  addBtn.style.transform = "scale(1)"
})

exitBtn.addEventListener("click", () => {
  ipcRenderer.send("close_app");
});

helpBtn.addEventListener("click", () => {
  active += 1
  const tmp = notesBox.innerHTML
  notesBox.innerHTML = "<div class='notesBox'><h3>Shortcuts</h3>- Control + Q To Exit!<br>- Control + D To Delete All Notes!<br>- Control + T To Change Theme!</div>"
  setTimeout(() => {
    notesBox.innerHTML = tmp
  }, 3000)
  delete tmp
})

sup.addEventListener("click", () => {
  ipcRenderer.send("github")
})