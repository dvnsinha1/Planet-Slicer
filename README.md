# Planet Slicer 🌍✨

Planet Slicer is an exciting space-themed arcade game that challenges players to master the art of cosmic slicing. In this visually stunning adventure, players navigate through a mesmerizing universe filled with colorful planets and treacherous black holes. Using intuitive WASD controls, players must slice through planets by matching the displayed letters while carefully avoiding deadly space hazards.

The game features a dynamic difficulty system that progressively intensifies the challenge, keeping players engaged and testing their reflexes. As you advance through levels, you'll encounter faster-moving planets, more frequent black holes, and increasingly complex patterns. The immersive space environment is enhanced by beautiful particle effects, smooth animations, and a captivating soundtrack that responds to your actions.

With its life system, score tracking, and level progression, Planet Slicer offers both casual fun and competitive challenge. The stunning cosmic visuals, including detailed planet designs, atmospheric effects, and dynamic backgrounds, create an unforgettable gaming experience that will keep you coming back for more.

## Live Demo
[Play Planet Slicer](https://main.d1hxubjq0whqwh.amplifyapp.com/)

## Game Overview
Planet Slicer puts you in control of a cosmic blade, challenging you to slice through planets while navigating the dangers of space. The game combines quick reflexes with strategic timing, creating an engaging experience that becomes more challenging as you progress through levels.

### Key Features
- 🎮 Intuitive WASD Controls
- 🌍 Beautiful Planet Animations
- ⚡ Dynamic Difficulty Scaling
- 🎯 Score Tracking System
- ❤️ Lives System
- 🎨 Stunning Space Visuals
- 🎵 Immersive Sound Effects
- 🏆 Level Progression

## How to Play

### Controls
- Press the key that matches the letter shown on the planet
- Each planet displays a letter (W, A, S, or D)
- Time your key presses carefully to slice the planets
- Missing planets will reduce your lives
- Hitting black holes ends the game

### Game Rules
1. **Match the Letters**: Press the key that corresponds to the letter shown on each planet
2. **Score Points**: Successfully slicing planets increases your score
3. **Avoid Black Holes**: Hitting a black hole ends your game
4. **Watch Your Lives**: Missing too many planets reduces your lives
5. **Level Up**: Score enough points to advance to higher levels with increased challenge

## Development Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- A modern web browser
- Code editor (VS Code recommended)

### Installation
1. Clone the repository:
\`\`\`bash
git clone https://github.com/dvnsinha1/Planet-Slicer
cd Planet-Slicer
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open your browser and navigate to \`http://localhost:5173\` (or the port shown in your terminal)

## Technologies Used
- React with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- HTML5 Canvas for game rendering
- Web Audio API for sound effects

## Deployment
The game is deployed using AWS Amplify, providing seamless continuous deployment and scalability.

### Deploying Your Own Version

1. Fork the repository
2. Set up an AWS Amplify account
3. Connect your repository to Amplify
4. Configure build settings:
\`\`\`yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
\`\`\`

## Contributing
Contributions are welcome! Feel free to submit issues and pull requests.

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments
- Space-themed assets and sound effects from various open-source contributors
- Inspired by classic arcade games and modern web technologies
- Special thanks to the React and TypeScript communities

## Future Enhancements
- Global leaderboard
- Multiple game modes
- Power-ups and special abilities
- Multiplayer support
- Mobile touch controls
- Additional planet types and obstacles

## AWS Amplify – Full-Stack Development and Hosting

### Key Benefits
1. **Easy Deployment**
   - Simple repository connection (GitHub, GitLab, Bitbucket)
   - Automatic deployments on code commits
   - Branch-based deployments for development and production
   - Zero-configuration CI/CD pipeline

2. **Integrated Backend Services**
   - Authentication and user management
   - API integration capabilities
   - Database integration options
   - File storage solutions
   - Easy scalability for future features

3. **Scalability Features**
   - Automatic scaling for varying traffic levels
   - Global content delivery through CloudFront
   - Built-in performance optimization
   - Reliable hosting infrastructure

4. **Cost-Effective Solution**
   - Free tier available for small applications
   - Pay-as-you-grow pricing model
   - No upfront infrastructure costs
   - Optimized resource utilization

5. **Developer-Friendly Interface**
   - Intuitive console for management
   - Comprehensive CLI tools
   - Real-time deployment logs
   - Built-in monitoring and analytics

### Deployment Process
1. **Initial Setup**
   ```bash
   # Install Amplify CLI
   npm install -g @aws-amplify/cli
   
   # Configure Amplify
   amplify configure
   ```

2. **Project Configuration**
   ```bash
   # Initialize Amplify in your project
   amplify init
   
   # Add hosting
   amplify add hosting
   ```

3. **Deploy Application**
   ```bash
   # Push changes to Amplify
   amplify push
   
   # Publish frontend
   amplify publish
   ```

### Monitoring and Management
- Access deployment logs through Amplify Console
- Monitor application performance
- View error reports and debugging information
- Track user analytics and usage patterns

### Security Features
- Built-in SSL/TLS encryption
- IAM role-based access control
- Environment variable management
- Secure content delivery

## Amazon Q Developer – Your AI-Powered Coding Assistant

### Key Capabilities
1. **Code Generation**
   - Generates clean and efficient TypeScript/React code
   - Creates reusable components and custom hooks
   - Implements game mechanics and animations
   - Produces type-safe code with proper interfaces
   - Assists with state management solutions

2. **Intelligent Debugging**
   - Real-time code analysis and error detection
   - Performance optimization suggestions
   - Memory leak identification
   - Game logic verification
   - Browser compatibility checks

3. **Code Enhancement**
   - Improves code readability and maintainability
   - Suggests modern React patterns and practices
   - Optimizes game performance
   - Recommends better TypeScript types
   - Enhances component reusability

4. **Documentation Support**
   - Generates comprehensive documentation
   - Creates TypeScript interfaces and type definitions
   - Documents component props and functions
   - Provides usage examples
   - Maintains up-to-date API documentation

5. **Game Development Features**
   - Canvas rendering optimization
   - Game loop implementation
   - Collision detection algorithms
   - Animation frame management
   - Audio handling improvements

### Development Workflow Integration
1. **Code Assistance**
   ```typescript
   // Amazon Q helps with complex game logic
   const handleCollision = (object1: GameObject, object2: GameObject) => {
     // Q suggests efficient collision detection
     return checkCollision(object1, object2);
   };
   ```

2. **Performance Optimization**
   ```typescript
   // Q identifies performance bottlenecks
   useEffect(() => {
     // Optimized game loop with proper cleanup
     const gameLoop = () => {
       updateGameState();
       renderFrame();
     };
   }, []);
   ```

3. **Type Safety**
   ```typescript
   // Q ensures proper typing
   interface GameObject {
     position: Vector2D;
     velocity: Vector2D;
     radius: number;
     // Additional properties...
   }
   ```

### Best Practices Implementation
- Clean code architecture
- React hooks optimization
- State management patterns
- Performance monitoring
- Error boundary implementation

### Development Benefits
- Faster development cycles
- Reduced debugging time
- Improved code quality
- Better documentation
- Enhanced maintainability

---

Happy Gaming! 🚀✨ 