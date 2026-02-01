# Contributing to Daily Spark

Thank you for your interest in contributing to Daily Spark! We welcome all contributions, from bug reports to new features.

## Code of Conduct

Please be respectful and constructive in all interactions. We're building a welcoming community for everyone.

## How to Contribute

### Reporting Bugs

Found a bug? Please open an issue on GitHub with:
- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior vs. actual behavior
- Your environment (browser, OS, etc.)

### Suggesting Enhancements

Have an idea to improve Daily Spark? Open an issue with:
- A clear description of the enhancement
- Why you think it would be useful
- Possible implementation approach (optional)

### Submitting Code

1. **Fork the repository** and create a branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our code style:
   - Use TypeScript for type safety
   - Follow existing naming conventions
   - Keep components small and focused
   - Write clear commit messages

3. **Test your changes**:
   ```bash
   npm run lint
   npm run test
   npm run build
   ```

4. **Push to your fork** and submit a Pull Request:
   - Include a clear title and description
   - Reference any related issues
   - Include screenshots for UI changes

## Development Setup

1. Clone the repo and install dependencies:
   ```bash
   git clone https://github.com/sahaya-savari/daily-spark.git
   cd daily-spark
   npm install
   ```

2. Start the dev server:
   ```bash
   npm run dev
   ```

3. Make your changes and test locally

## Code Style

- Use TypeScript for all new code
- Follow React best practices (functional components, hooks)
- Use Tailwind CSS for styling (no inline styles)
- Keep functions pure and focused
- Add comments for complex logic

## Pull Request Guidelines

- Keep PRs focused on a single feature or fix
- Make sure the build passes: `npm run build`
- Update documentation if needed
- Add tests for new features

## Questions?

Open a discussion or issue on GitHub. We're happy to help!

---

**Thank you for making Daily Spark better! 🔥**
