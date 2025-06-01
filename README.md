# YourNextStory
This is a media recommendation website which allows users to browse media projects (movies, series, games), view personal recommendations, have discussions about specific projects in comments. 

# Structure 
- Main (index.html) is a main page, which provides user with the overview of feautured projects and selected few projects that are tagged as popular. Dark-theme applies here;
- Profile page will prompt user with a log-in form at first. Signing in for the first time will create a user profile, that can be accessed later. After registration user can choose which types of media, platforms and themes are preferred. It will inform what appears on the Recommendation page. Also in profile user can see their library with projects they added;
- Recommendation page outputs all projects that match user's preferred tags. Here user can sort and filter through the selection. For guest users this page will show randomly chosen projects and an invitation to log in;
- Search page is for looking up specific projects by name;
- Project page shows description, details and poster for the project. Here user can add project to their library (if logged in). Also registered users can leave their comments here to discuss.

# Starting
- YourNextStory runs after command "node server.js";
- Weather app can be accessed through, for example, "Open with Live Server" in VS Code.
