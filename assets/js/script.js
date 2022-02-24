var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

  //check due date
  auditTask(taskLi);

  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

// edit existing task
$(".list-group").on("click", "p", function() {
  var text = $(this)
    .text()
    .trim();
  var textInput = $("<textarea>")
    .addClass("form-control")
    .val(text);
  $(this).replaceWith(textInput);
  textInput.trigger("focus");
});

// save edited task
$(".list-group").on("blur", "textarea", function() {
  // get text, status and index
  var text = $(this)
    .val()
    .trim();
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");
  var index = $(this)
    .closest(".list-group-item")
    .index();
  
  // update text and save
  tasks[status][index].text = text;
  saveTasks();

  // revert textarea to p
  var taskP = $("<p>")
    .addClass("m-1")
    .text(text);
  $(this).replaceWith(taskP);

});

// edit due date
$(".list-group").on("click", "span", function() {
  var date = $(this)
    .text()
    .trim();
  var dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date);

  $(this).replaceWith(dateInput);

dateInput.datepicker({
  //minDate: 0,
  onClose: function() {
    $(this).trigger("change");
  }
});

  dateInput.trigger("focus");
});

// save new due date
$(".list-group").on("change", "input[type='text']", function() {
  // get date, status and index
  var date = $(this)
    .val();
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");
  var index = $(this)
    .closest(".list-group-item")
    .index();
  
  // update date and save
  tasks[status][index].date = date;
  saveTasks();

  // revert input to span
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);
  $(this).replaceWith(taskSpan);

  auditTask($(taskSpan).closest(".list-group-item"));

});


// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// drag between status columns
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function(event) {
    console.log("activate", this);
  },
  deactivate: function(event) {
    console.log("deactivate", this);
  },
  over: function(event) {
    console.log("over", this);
  },
  out: function(event) {
    console.log("out", this);
  },
  update: function(event) {
    var tempArr = [];

    $(this).children().each(function() {
      var text = $(this)
        .find("p")
        .text()
        .trim();

      var date = $(this)
        .find("span")
        .text()
        .trim();

      tempArr.push({
        text: text,
        date: date
      })
    });

    var arrName = $(this)
      .attr("id")
      .replace("list-", "");
    
    tasks[arrName] = tempArr;
    saveTasks();

  }
});

// audit tasks by due date
var auditTask = function(taskEl) {
  // get date from taskel
  var date = $(taskEl).find("span").text().trim();
  console.log(date);

  // convert date from string to moment object at 5 pm
  var time = moment(date, "L").set("hour", 17);

  // remove old classes
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");
  
  // apply new class if near/over due date
  if(moment().isAfter(time)) {
    $(taskEl).addClass("list-group-item-danger");
  }
  else if (Math.abs(moment().diff(time, "days")) <= 2) {
    
    $(taskEl).addClass("list-group-item-warning");
  }
  
};

// delete by dragging to trash
$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    console.log("drop");
    ui.draggable.remove();
  },
  over: function(event, ui) {
    console.log("over trash");
  },
  out: function(event, ui) {
    console.log("out trash");
  }
});

$("#modalDueDate").datepicker({
  //minDate: 0
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();


