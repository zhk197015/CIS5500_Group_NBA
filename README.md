# CIS5500_Group_NBA

## Description

This is a course project for CIS 550 Databases & Information System (Spring 2024) at the University of Pennsylvania. It showcases a NBA information website where users can browse through teams and players, simulate game results, and trade players for their chosen teams.

## Tech Stack

<img src="https://img.shields.io/badge/-React-000000?style=flat&logo=react&logoColor=00C8FF"> <img src="http://img.shields.io/badge/-Node.js-4DB33D?style=flat&logo=Node.js&logoColor=white"> <img src="https://img.shields.io/badge/-Express.js-eed718?style=flat&logo=express&logoColor=white"> <img src="https://img.shields.io/badge/-MySQL-F29111?style=flat&logo=mysql&logoColor=white"> 

## Folder Structure
```
.
├── client                  # FRONTEND
│   ├── .gitignore          # contains untracked filed
│   ├── package             # maintains project dependency tree
│   ├── package-lock        # saves the exact version of each package in the dependency tree
│   ├── public              # static resources, such as icons and images
│   └── src
│       ├── components      # holds components and styles
│       ├── helpers         # holds helper functions
│       ├── pages           # holds pages
│       ├── App.js          # holds the root component of the React application and provides the theme
│       ├── config.json     # stores server config details 
│       └── index.js        # holds main JavaScript entry point to the application
├── server                  # BACKEND
│   ├── .gitignore          # contains untracked filed
│   ├── config.json         # holds RDS connection details
│   ├── package.json        # maintains project dependency tree
│   ├── package-lock.json   # saves the exact version of each package in the dependency tree
│   ├── routes.js           # stores code for the API routes’ handler functions
│   └── server.js           # stores code for the routed HTTP application
```