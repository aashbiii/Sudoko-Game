# 🧩 Sudoku Web Application (Flask)

A **web-based Sudoku game** developed using **Python Flask**, focusing on **clean UI design** and **correct Sudoku validation logic**.
This project demonstrates a complete **client–server web application** with backend verification and interactive frontend features.

---

## 🚀 Features

* ✅ 9×9 Sudoku grid
* ✅ Pre-filled and user-input cells
* ✅ Server-side solution validation using Flask
* ✅ Prevents incorrect Sudoku solutions
* ✅ “Check Solution” functionality
* ✅ Reset / New Game option
* ✅ Timer to track completion time
* ✅ Success message on correct completion
* ✅ Simple, responsive UI

---

## 🛠 Technologies Used

* **Backend:** Python (Flask)
* **Frontend:** HTML, CSS, JavaScript
* **Version Control:** Git & GitHub
* **Deployment Ready:** Render / Heroku compatible

---

## 📁 Project Structure

```
flask-sudoku/
│── app.py
│── requirements.txt
│
├── templates/
│   └── index.html
│
├── static/
│   ├── style.css
│   └── script.js
```

---

## ▶️ How to Run the Project Locally

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/aashbiii/Sudoko-Game.git
cd Sudoko-Game
```

### 2️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

### 3️⃣ Run the Application

```bash
python app.py
```

### 4️⃣ Open in Browser

```
http://127.0.0.1:5000/
```

---

## 🎯 How the Sudoku Logic Works

* The Sudoku puzzle is rendered from predefined data.
* User input is collected on the frontend.
* When **“Check Solution”** is clicked:

  * The grid is sent to the Flask backend.
  * The backend validates it against the correct solution.
  * A success or error message is returned.
* Timer stops when the correct solution is submitted.

---

## 📸 Screenshots

*(Add screenshots here for higher marks)*

* Sudoku Grid UI
* Incorrect solution validation
* Success message after completion

---

## 🌐 Deployment

This application can be deployed using:

* **Render**
* **Heroku**
* **Railway**

The project is structured to support easy cloud deployment.

---

## 👨‍🎓 Academic Use

This project was developed as part of a **web application / software engineering assignment**, focusing on:

* UI design
* Correct business logic
* Client–server architecture
* Version control using GitHub

---

## 📝 License

This project is for **educational purposes**.

---

## ⭐ Acknowledgements

Inspired by classic Sudoku game mechanics and implemented using Flask for backend validation.

---

