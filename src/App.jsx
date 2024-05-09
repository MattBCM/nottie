import { useCallback, useEffect, useState } from "react";
import "./App.css";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import { createClient } from "@supabase/supabase-js";
import SideData from "./SideData";
import Logo from "./assets/DefaultNottie_text.png";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON
);

function App() {
  let [currDate, setCurrDate] = useState(new Date());
  let [month, setMonth] = useState(new Date().getMonth());
  let [year, setYear] = useState(new Date().getFullYear());
  let [timestamp, setTimeStamp] = useState([]);
  let [addbtn, setAddBtns] = useState(false);
  let [notesData, setNotesData] = useState([]);
  let [weeks, setWeeks] = useState(null);
  let timerlength = 8;
  let quill;
  var editor;

  let edited = [];

  let testLink = [
    {
      title: "Tests",
      text: "something something something",
      sub: [
        {
          title: "Test inside test",
          text: "potato potato",
          sub: [],
        },
      ],
    },
    {
      title: "Tests",
      text: "something something something",
      sub: [],
    },
  ];

  let getMonthName = (input) => {
    switch (input) {
      case 0:
        return "January";
      case 1:
        return "February";
      case 2:
        return "March";
      case 3:
        return "April";
      case 4:
        return "May";
      case 5:
        return "June";
      case 6:
        return "July";
      case 7:
        return "August";
      case 8:
        return "September";
      case 9:
        return "October";
      case 10:
        return "November";
      case 11:
        return "December";
      default:
        return "invalid";
    }
  };

  const loadData = async () => {
    let currTime = new Date();
    console.log(currTime.getFullYear() + " " + currTime.getMonth());
    let incData = await supabase
      .from("NottieData")
      .select()
      .eq("month", month)
      .eq("year", year)
      .then(({ data, error }) => {
        console.log("reading data");
        console.log(data);
        //setTimeStamp(data[0].data_time_posted);
        if (data.length <= 0) {
          console.log("No Data Found");
          const createNewEntry = async () => {
            await supabase
              .from("NottieData")
              .insert({
                year: currTime.getFullYear(),
                month: currTime.getMonth(),
              })
              .then((e) => {
                console.log("added entry");
                return {};
              })
              .catch((err) => {
                console.log(err);
              });
          };
          createNewEntry();
        }
        return data[0].data;
      })
      .catch((error) => {
        console.log(error);
      });
    return incData;
  };

  useEffect(() => {
    setTimeout(() => {
      let currTime = new Date();
      supabase
        .from("NottieData")
        .select()
        .eq("month", currTime.getMonth())
        .eq("year", currTime.getFullYear())
        .then(({ data, error }) => {
          let texts = document.getElementsByClassName("ce-paragraph");
          for (let i = 0; i < texts.length; i++) {
            let pdata = texts[i].parentElement.parentElement.dataset.id;
            console.log(pdata);
            let filteredData = data[0].data_time_posted;
            console.log(filteredData);
            let found = null;
            filteredData.forEach((entry) => {
              if (entry.id == pdata) found = entry;
            });
            console.log(found);
            if (found) {
              let postTime = new Date(found.time);
              let timestamp_p = document.createElement("p");
              //timestamp_p.append(`${postTime.getHours()}:${postTime.getMinutes() < 10 ? "0" + postTime.getMinutes() : postTime.getMinutes()}`);
              timestamp_p.append(
                `${getMonthName(
                  postTime.getMonth()
                )} ${postTime.getDate()}, ${postTime.getFullYear()} at ${postTime.getHours()}:${
                  postTime.getMinutes() < 10
                    ? "0" + postTime.getMinutes()
                    : postTime.getMinutes()
                }`
              );
              texts[i].parentElement.append(timestamp_p);
              texts[i].parentElement.classList.add("n-edit");
              if (found.edited) {
                texts[i].parentElement.classList.add("edited");
                texts[i].nextSibling.innerHTML += "<em> (edited)</em>";
              }
            }
          }
        });
    }, 100);
  }, [timestamp]);

  useEffect(() => {
    getDays(month, year);
    loadData().then((resp) => {
      editor = new EditorJS({
        holder: "text-box",
        data: resp,
      });
      setTimeout(() => {
        let currTime = new Date();
        document.addEventListener("focusin", function (e) {
          const target = e.target.closest(".ce-paragraph");
          if (target) {
            target.classList.add("text-onfocus");
            target.onkeydown = (e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                if (target.textContent != "") {
                  supabase
                    .from("NottieData")
                    .select()
                    .eq("month", month)
                    .eq("year", year)
                    .then(({ data, error }) => {
                      console.log(month + " " + year);
                      let edited = data[0].data_time_posted;
                      console.log(timestamp);
                      if (target.parentElement.classList.contains("edited")) {
                      } else if (
                        target.parentElement.classList.contains("n-edit")
                      ) {
                        console.log(
                          target.parentElement.parentElement.dataset.id
                        );
                        edited.forEach((element) => {
                          if (
                            target.parentElement.parentElement.dataset.id ==
                            element.id
                          )
                            element.edited = true;
                        });
                        console.log(edited);
                        //setTimeStamp(edited);
                        target.nextSibling.innerHTML += "<em> (edited)</em>";
                        target.parentElement.classList.add("edited");
                      } else {
                        let timestamp_p = document.createElement("p");
                        let currTime = new Date();
                        timestamp_p.append(
                          `${getMonthName(
                            currTime.getMonth()
                          )} ${currTime.getDate()}, ${currDate.getFullYear()} at ${currTime.getHours()}:${
                            currTime.getMinutes() < 10
                              ? "0" + currTime.getMinutes()
                              : currTime.getMinutes()
                          }`
                        );
                        target.parentElement.append(timestamp_p);
                        target.parentElement.classList.add("n-edit");
                        edited.push({
                          id: `${target.parentElement.parentElement.dataset.id}`,
                          time: currTime,
                          edited: false,
                        });
                        console.log(edited);
                        //setTimeStamp(edited);
                      }
                      editor
                        .save()
                        .then((output) => {
                          let insertData = async () => {
                            console.log(output.blocks);
                            console.log(edited);
                            await supabase
                              .from("NottieData")
                              .update({
                                data: output,
                                data_time_posted: edited,
                              })
                              .eq("month", month)
                              .eq("year", year)
                              .then(() =>
                                console.log("Successfully saved data")
                              )
                              .catch((err) => console.log(err));
                          };
                          insertData();
                        })
                        .catch((err) => {
                          console.log(err);
                        });
                    });
                }
              } else if (e.key == "Backspace" && target.textContent == "") {
                supabase
                  .from("NottieData")
                  .select()
                  .eq("month", currTime.getMonth())
                  .eq("year", currTime.getFullYear())
                  .then(({ data, error }) => {
                    let removeTarget =
                      target.parentElement.parentElement.dataset.id;
                    console.log(removeTarget);
                    let filteredTime = [];
                    data[0].data_time_posted.forEach((entry) => {
                      if (entry.id != removeTarget) filteredTime.push(entry);
                    });

                    console.log(filteredTime);
                    editor.save().then((output) => {
                      output.blocks.filter((entry) => {
                        entry.id != removeTarget;
                      });
                      console.log("Filtered Output");
                      console.log(output.blocks);
                      supabase
                        .from("NottieData")
                        .update({
                          data: output,
                          data_time_posted: filteredTime,
                        })
                        .eq("month", month)
                        .eq("year", year)
                        .then(() => console.log("Successfully saved data"))
                        .catch((err) => console.log(err));
                    });
                  });
              }
            };
          } else {
            console.log("Not near target");
          }
        });
        document.addEventListener("focusout", function (e) {
          const target = e.target.closest(".ce-paragraph");
          if (target) {
            target.classList.remove("text-onfocus");
          } else {
            console.log("Not near target");
          }
        });
        //addClasses();
      }, 100);
    });
  }, [month, year]);

  useEffect(() => {
    setNotesData(JSON.parse(localStorage.getItem("notes")));
    /*
    loadData().then((resp) => {
      editor = new EditorJS({
        holder: "text-box",
        data: resp,
      });
    });
    */

    let int = setInterval(() => {
      setCurrDate(new Date());
    }, 1000);
    /*
    let addClasses = () => {
      let texts = document.getElementsByClassName("ce-paragraph")
      for(var i = 0; i < texts.length; i++){
        texts[i].addEventListener("focusin", function(){
          this.style.backgroundColor = "red";
          this.onkeydown = (e) => {
            if(e.key != "Enter"){
              console.log("Something");
            }
            else{
              let timestamp = document.createElement("p");
              let currTime = new Date();
              timestamp.append(`${currTime.getHours()}:${currTime.getMinutes() < 10 ? "0" + currTime.getMinutes() : currTime.getMinutes()}`);
              this.parentElement.append(timestamp);
              this.parentElement.classlist.add("n-edit");
              let block = this.parentElement.parentElement.nextSibling;
            }
          }
        })
        texts[i].addEventListener("focusout", function(){
          this.style.backgroundColor = "blue";
        })
        
      }
    }
*/
    /*

    var allbtns = document.getElementsByClassName("newSectBtn");
    for (let i = 0; i < allbtns.length; i++) {
      allbtns[i].addEventListener("click", (e) => {
        console.log(e.currentTarget);
        let title = e.currentTarget.previousElementSibling.value;
        let divCont =
          e.currentTarget.previousElementSibling.previousElementSibling;
        divCont.insertAdjacentHTML(
          "beforeend",
          `<button class="accordion">${title}</button>
          <div class="panel">
            <textarea placeholder="write something here..."></textarea>
            <div class="test"></div>
            <input
              type="text"
              placeholder="Write title of sub section..."
            ></input>
            <button>Submit</button>
          </div>`
        );
        setAddBtns(!addbtn)
      });
      
    }
    */

    console.log(notesData);
    console.log("I call once");
    return () => clearInterval(int);
  }, []);

  const addEvntLst = useCallback((e) => {
    console.log(e.currentTarget);
    let title = e.currentTarget.previousElementSibling.value;
    let divCont = e.currentTarget.parentElement.previousElementSibling;
    divCont.insertAdjacentHTML(
      "beforeend",
      `<button class="accordion relative sectionDelete">
      ${title}
      </button>`
    );

    console.log(divCont.lastChild);

    divCont.lastChild.insertAdjacentHTML(
      "beforeend",
      `
    <button class="absolute top-y-2/4 right-2 hover:cursor-pointer" onclick='((e) => {
      let btn = this.parentElement;
      let panel = btn.nextElementSibling;
      panel.remove();
      btn.remove();
    })()'>
      <i class="fa-solid fa-trash"></i>
    </button>
    `
    );

    divCont.insertAdjacentHTML(
      "beforeend",
      `
    <div class="panel">
          <textarea placeholder="Write something here..."></textarea>
          <div class="test"></div>
          <div class="flex justify-evenly items-center">
          <input
            type="text"
            placeholder="Write title of sub section..."
            class="mb-1"
          ></input>
          <button class="newSectBtn">
          <i class="fa-solid fa-circle-plus"></i>
          </button>
          </div>
        </div>
    `
    );
    console.log(divCont);
    setAddBtns(!addbtn);
  });

  const getDays = (month, year) => {
    let temp = [];
    let firstDay = new Date(year, month, 1).getDay();
    for (let w = 0; w < 6; w++) {
      let ent = [];
      for (let days = 0 + w * 7; days < (w + 1) * 7; days++) {
        if (days - firstDay < 0) ent.push(-1);
        else ent.push(days - firstDay + 1);
      }
      temp.push(ent);
    }

    console.log(temp);

    setWeeks(temp);
  };

  useEffect(() => {
    setTimeout(() => {
      var allbtns = document.getElementsByClassName("newSectBtn");
      console.log("testing");
      for (let i = 0; i < allbtns.length; i++) {
        if (allbtns[i].getAttribute("listener") !== "true") {
          allbtns[i].addEventListener("click", addEvntLst);
          console.log(allbtns[i]);
          console.log("event been attached");
        }
        allbtns[i].setAttribute("listener", "true");
      }
    }, 100);
  }, [addbtn]);

  var acc = document.getElementsByClassName("accordion");
  for (let i = 0; i < acc.length; i++) {
    if (acc[i].getAttribute("event") !== "true") {
      acc[i].setAttribute("event", "true");
      acc[i].addEventListener("click", function () {
        this.classList.toggle("active");
        var parent = this.parentElement.parentElement;
        var panel = this.nextElementSibling;
        if (panel.style.maxHeight) {
          panel.style.maxHeight = null;
        } else {
          panel.style.maxHeight = panel.scrollHeight + "px";
          parent.style.maxHeight =
            parseInt(parent.style.maxHeight) + panel.scrollHeight + "px";
        }
      });
    }
  }

  const recSavedData = (elem) => {
    let savedData = [];
    for (let child of elem.children) {
      if (child.classList.contains("panel"))
        savedData.push({
          title: child.previousElementSibling.innerText,
          text: child.children[0].value,
          sub: child.children[1].classList.contains("test")
            ? recSavedData(child.children[1])
            : null,
        });
    }
    return savedData;
  };

  let para = document.getElementsByClassName("ce-paragraph");
  for (let i = 0; i < para.length; i++) {
    if (para[i].getAttribute("event") !== "true") {
      para[i].setAttribute("event", "true");
      para[i].addEventListener("paste", (e) => {
        const text = e.clipboardData.getData("text/plain");
        console.log(text);
        para[i].innerText = text;
      });
    }
  }

  return (
    <>
      <div className="w-screen h-screen flex flex-row">
        <div className="basis-1/6 h-full flex flex-col side-panel">
          <div className="basis-1/6">
            <div className="w-full h-full logo-cont bg-contain bg-center bg-no-repeat"></div>
          </div>
          <div className="basis-2/6 w-full calendar px-3 overflow-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (
                  e.target.months.value == month &&
                  e.target.years.value == year
                )
                  window.alert(
                    "Time already selected as input. Please choose another month and/or year"
                  );
                else {
                  supabase
                    .from("NottieData")
                    .select()
                    .eq("month", e.target.months.value)
                    .eq("year", e.target.years.value)
                    .then((data, error) => {
                      console.log(data);
                      if (data.data.length <= 0)
                        window.alert(
                          `No such data exists for ${getMonthName(
                            e.target.months.value
                          )} ${e.target.years.value}`
                        );
                      else {
                        setMonth(parseInt(e.target.months.value));
                        setYear(e.target.years.value);
                        document
                          .getElementsByClassName("codex-editor")[0]
                          .remove();
                        /*editor = new EditorJS({
                        holder: "text-box",
                        data: data.data[0].data,
                      });
                      */
                        setTimeout(() => {
                          let texts =
                            document.getElementsByClassName("ce-paragraph");
                          console.log(texts);
                          for (let i = 0; i < texts.length; i++) {
                            let pdata =
                              texts[i].parentElement.parentElement.dataset.id;
                            console.log(pdata);
                            let filteredData = data.data[0].data_time_posted;
                            console.log(filteredData);
                            let found = null;
                            filteredData.forEach((entry) => {
                              if (entry.id == pdata) found = entry;
                            });
                            console.log(found);
                            if (found) {
                              let postTime = new Date(found.time);
                              let timestamp_p = document.createElement("p");
                              //timestamp_p.append(`${postTime.getHours()}:${postTime.getMinutes() < 10 ? "0" + postTime.getMinutes() : postTime.getMinutes()}`);
                              timestamp_p.append(
                                `${getMonthName(
                                  postTime.getMonth()
                                )} ${postTime.getDate()}, ${postTime.getFullYear()} at ${postTime.getHours()}:${
                                  postTime.getMinutes() < 10
                                    ? "0" + postTime.getMinutes()
                                    : postTime.getMinutes()
                                }`
                              );
                              texts[i].parentElement.append(timestamp_p);
                              texts[i].parentElement.classList.add("n-edit");
                              if (found.edited) {
                                texts[i].parentElement.classList.add("edited");
                                texts[i].nextSibling.innerHTML +=
                                  "<em> (edited)</em>";
                              }
                            }
                          }
                        }, 200);
                      }
                    });
                }
              }}
              className="flex flex-col justify-center content-center"
            >
              <div className="cal-cont w-full relative">
                <div className="flex flex-row w-full justify-evenly my-5 text-white">
                  <select
                    name="months"
                    id="years_select"
                    className="text-2xl"
                    defaultValue={month}
                  >
                    <option value="0">January</option>
                    <option value="1">February</option>
                    <option value="2">March</option>
                    <option value="3">April</option>
                    <option value="4">May</option>
                    <option value="5">June</option>
                    <option value="6">July</option>
                    <option value="7">August</option>
                    <option value="8">September</option>
                    <option value="9">October</option>
                    <option value="10">November</option>
                    <option value="11">December</option>
                  </select>
                  <select
                    name="years"
                    id="years_select"
                    className="text-2xl"
                    defaultValue={year}
                  >
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                  </select>
                </div>
                <table className="w-full">
                  <tr className="table-days">
                    <th>Sun</th>
                    <th>Mon</th>
                    <th>Tue</th>
                    <th>Wed</th>
                    <th>Thu</th>
                    <th>Fri</th>
                    <th>Sat</th>
                  </tr>
                  {weeks &&
                    weeks.map((entry) => {
                      return (
                        <tr>
                          {entry.map((day) => {
                            return day != -1 &&
                              new Date(year, month + 1, 0).getDate() >= day ? (
                              <td className="text-center font-bold">{day}</td>
                            ) : (
                              <td></td>
                            );
                          })}
                        </tr>
                      );
                    })}
                </table>
              </div>
              <div className="w-full flex flex-row justify-center items-center">
                <input
                  type="submit"
                  value="Submit"
                  id="cal-submit"
                  className="text-2xl font-bold rounded-xl"
                ></input>
              </div>
            </form>
          </div>
          <div className="basis-3/6 acc-container max-h-full overflow-auto pb-5 relative">
            <div className="flex flex-row justify-between content-center fixed z-10 w-1/6 acc-header">
              <h1 className="pl-2 text-6xl">Notes</h1>
              <button
                className="saveButton pr-2"
                onClick={(e) => {
                  let cont =
                    e.currentTarget.parentElement.nextElementSibling
                      .nextElementSibling.nextElementSibling.nextElementSibling;
                  let savedData = [];
                  if (!cont.classList.contains("test"))
                    window.alert("there are no notes to be saved");
                  else {
                    for (let child of cont.children) {
                      if (child.classList.contains("panel"))
                        savedData.push({
                          title: child.previousElementSibling.innerText,
                          text: child.children[0].value,
                          sub: child.children[1].classList.contains("test")
                            ? recSavedData(child.children[1])
                            : null,
                        });
                    }
                    localStorage.setItem("notes", JSON.stringify(savedData));
                    //setNotesData(savedData);
                    window.alert("saved data");
                  }
                }}
              >
                <i className="fa-solid fa-floppy-disk" />
              </button>
            </div>
            <br />
            <br />
            <br />
            <SideData data={notesData} />
            <div className="flex justify-evenly items-center">
              <input
                id="sect-tb"
                type="text"
                name="section_name"
                placeholder="new section title..."
              ></input>
              <button className="newSectBtn" type="button">
                <i className="fa-solid fa-circle-plus"></i>
              </button>
            </div>
          </div>
        </div>
        <div className="basis-5/6 flex flex-col">
          <div className="basis-1/6 w-full side-panel flex justify-center items-center">
            <h1>
              {currDate.toDateString() + " at " + currDate.toLocaleTimeString()}
            </h1>
          </div>
          <div
            id="text-box"
            className="basis-5/6 w-full h-5/6 text-black max-h-full overflow-auto"
          ></div>
        </div>
      </div>
    </>
  );
}

export default App;
