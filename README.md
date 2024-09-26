<h1>BL Sheet Backend</h1>

<p><strong>BL Sheet Backend</strong> is the server-side component of the BL Sheet project management and productivity tool. This backend is built using Node.js and provides RESTful APIs to handle project management, task tracking, budget management, and user collaboration functionalities.</p>

<h2>Features</h2>

<ul>
  <li>RESTful API for managing projects, tasks, and budgets</li>
  <li>User authentication and authorization</li>
  <li>Real-time collaboration via WebSockets</li>
  <li>Data storage and retrieval using MongoDB</li>
</ul>

<h2>GitHub Repository</h2>

<ul>
  <li><strong>Backend</strong> (Node.js): <a href="https://github.com/codemitrayt/BLSheetServer">BL Sheet Backend GitHub Repository</a></li>
  <li>For the frontend, visit the repository here: <a href="https://github.com/codemitrayt/BLSheet">BL Sheet Frontend Repository</a></li>
</ul>

<h2>Installation and Setup</h2>

<ol>
  <li>Clone the backend repository:</li>
  <pre><code>git clone https://github.com/codemitrayt/BLSheetServer.git</code></pre>

  <li>Navigate into the project directory:</li>
  <pre><code>cd BLSheetServer</code></pre>

  <li>Install the dependencies:</li>
  <pre><code>npm install</code></pre>

  <li>Set up environment variables by creating a <code>.env</code> file in the root directory with the reference .env.example</li>

  <li>Start the server:</li>
  <pre><code>npm run dev</code></pre>

  <p>The server will be running at <code>http://localhost:5500</code>.</p>
</ol>

<h2>How to Contribute</h2>

<p>We welcome contributions to the backend of BL Sheet! To contribute, follow these steps:</p>

<ol>
  <li><strong>Fork</strong> the repository on GitHub.</li>
  <li><strong>Clone</strong> your forked repository to your local machine:</li>
  <pre><code>git clone https://github.com/your-username/BLSheetServer.git</code></pre>

  <li>Create a new <strong>branch</strong> for your feature or bug fix:</li>
  <pre><code>git checkout -b feature/your-feature-name</code></pre>

  <li><strong>Commit</strong> your changes:</li>
  <pre><code>git commit -m "Add feature or fix description"</code></pre>

  <li><strong>Push</strong> your branch to your forked repository:</li>
  <pre><code>git push origin feature/your-feature-name</code></pre>

  <li>Open a <strong>Pull Request</strong> on the original repository and provide a detailed description of your changes.</li>
</ol>

<h3>Contribution Guidelines</h3>

<ul>
  <li>Ensure your code follows best practices and is well-documented.</li>
  <li>Make sure your code passes existing tests and includes new tests for new features.</li>
  <li>Respectful and constructive feedback is encouraged during code reviews.</li>
</ul>

<h2>License</h2>

<p>This project is licensed under the MIT License. See the <a href="https://github.com/codemitrayt/BLSheetServer/blob/main/LICENSE">LICENSE</a> file for details.</p>
