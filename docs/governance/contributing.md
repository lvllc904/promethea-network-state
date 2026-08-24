# Contributing to Promethea Network State

Welcome, contributor! We are thrilled that you are interested in joining our mission to build a more transparent and equitable digital world. This document is your guide to becoming a valued contributor and, in turn, a stakeholder in the Promethea Network State.

## The Promethean Philosophy: Your Contribution is Ownership

At Promethea, we believe that every contribution, whether it's a line of code, a bug fix, a piece of documentation, or even a valuable idea, adds to the collective value of our network. In line with our constitution, we have created a system where your "sweat equity" is automatically and transparently translated into ownership.

**This is not a traditional open-source project.** When you contribute, you are not just giving your time; you are earning a stake in the network. Our automated systems will analyze your contributions, assign them a value, and update the project's capitalization table in real-time. You will be able to see your ownership stake grow with every merged pull request.

## How Sweat Equity Compensation Works

Our system is designed to be as transparent as possible. Here’s how your contributions are translated into sweat equity:

1.  **Contribution Analysis**: When you submit a pull request, our automated system analyzes your changes. This analysis considers factors such as:
    *   **Code**: The quantity, complexity, and quality of the code you've written.
    *   **Tests**: The comprehensiveness and effectiveness of the tests you've added.
    *   **Documentation**: The clarity and usefulness of any documentation you've created or improved.
    *   **Other Contributions**: We are developing methods to value non-code contributions, such as bug reports, feature ideas, and community support.

2.  **Value-Attribution**: Based on this analysis, your contribution is assigned a value, which is pegged to a stable unit of account.

3.  **Cap Table Update**: This value is then used to update the project's capitalization table. Your personal stake in the network increases in proportion to the value of your contribution.

4.  **Real-Time Financial Reporting**: All financial reports, including the cap table, are updated in real-time and are publicly accessible (while respecting individual privacy). This ensures that every contributor can see how their work is impacting the network's value and their own stake in it.

## The Contribution Workflow: A Step-by-Step Guide

We have designed our contribution process to be as straightforward as possible, even if you are new to Git and GitHub.

### Step 1: Fork the Repository

First, you need to create your own copy of the repository.

1.  Navigate to the main repository page: `https://github.com/lvllc904/promethea-network-state`
2.  In the top-right corner, click the "Fork" button.

### Step 2: Clone Your Fork

Now, you need to download your forked repository to your computer.

1.  On your fork's GitHub page, click the green "Code" button.
2.  Copy the URL (it should look something like `https://github.com/YourUsername/promethea-network-state.git`).
3.  Open your terminal and run the following command (replace `YourUsername` with your GitHub username):

    ```bash
    git clone https://github.com/YourUsername/promethea-network-state.git
    ```

4.  Navigate into the newly created directory:

    ```bash
    cd promethea-network-state
    ```

### Step 3: Create a `Testing` Branch

All new work happens on a `Testing` branch. This keeps the main branches clean.

1.  Create a new branch for your work. It's a good practice to give it a descriptive name (e.g., `Testing-new-feature` or `Testing-bug-fix`).

    ```bash
    git checkout -b Testing-your-feature-name
    ```

### Step 4: Make Your Changes (The "Structured" and "Vibe" Methods)

This is where you bring your unique talents to the project. We welcome two primary styles of contribution:

*   **The Structured Method**: This is the traditional, human-driven approach. You have a clear, pre-defined plan for a feature or bug fix, and you execute that plan.

*   **The "Vibe" Method (AI-Assisted Coding)**: This is an exploratory and collaborative approach, designed for ideating and building in partnership with an AI agent. You might start with a general goal, a "vibe," for a feature. From there, you can work with your AI coding partner to:
    *   Explore different implementations.
    *   Generate and refine code snippets.
    *   Create mockups and prototypes.
    *   Co-author documentation.
    *   Debug and test your work.

    Our system is built to recognize and value this dynamic, creative process. We understand that innovation in the age of AI is often a fluid dialogue between human and machine, and we reward the outcomes of that collaboration.

### The Promethean Concord: Communicating Intent

To help all developers (human and AI) navigate between the Structured and Vibe methods, we use a system called **The Promethean Concord**. This is a framework for embedding meaning and intent directly into our code. By using specific conventions, we signal whether a piece of code is a stable, "Core" component or a dynamic, "Fluid" one.

This is crucial for effective collaboration. It tells AI citizens when to be cautious and when to be creative. It tells human developers about the stability and blast radius of the code they are touching.

**All contributors are expected to understand and apply this framework.**

> **[Read the full guide to The Promethean Concord here.](docs/adr/001-promethean-concord.md)**

### Step 5: Commit Your Changes

Once you've made some progress, you need to save your changes.

1.  Add the files you've changed:

    ```bash
    git add .
    ```

2.  Commit your changes with a descriptive message:

    ```bash
    git commit -m "A brief description of the changes you made"
    ```

### Step 6: Push to Your Fork

Now, you need to upload your changes to your fork on GitHub.

```bash
git push origin Testing-your-feature-name
```

### Step 7: Submit a Pull Request

This is the final step. You are proposing that your changes be added to the main project.

1.  Go to your fork on GitHub (`https://github.com/YourUsername/promethea-network-state`).
2.  You should see a button that says "Compare & pull request." Click it.
3.  Ensure the base repository is `lvllc904/promethea-network-state` and the base branch is the appropriate `Alpha-[n]` branch. The head repository should be your fork, and the compare branch should be your `Testing-your-feature-name` branch.
4.  Add a clear title and a detailed description of your changes.
5.  Click "Create pull request."

Once you've submitted your pull request, our automated systems will take over, and you'll be able to track the progress of your contribution and its impact on your sweat equity.

## Code of Conduct

All contributors are expected to adhere to our Code of Conduct. Please read it before you start contributing.
