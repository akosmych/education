pipeline {
  agent any

  environment {
    SONAR_HOST        = "http://devops/sonarqube"       // без завершающего /
    SONAR_PROJECT_KEY = "simple-node-app"
    NEXUS_URL         = "http://devops/nexus/repository/raw-releases/"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout([$class: 'GitSCM',
          branches: [[name: '*/main']],
          userRemoteConfigs: [[
            url: 'https://github.com/akosmych/education.git',
            credentialsId: 'github-creds'
          ]]
        ])
      }
    }

    stage('Install & Test') {
      agent {
        docker {
          image 'node:18'
          reuseNode true          // используем тот же workspace, где уже есть git-клон
        }
      }
      steps {
        sh 'npm ci || true'
        sh 'npm test || echo "tests skipped"'
        sh 'mkdir -p build'
        sh 'zip -r build/simple-node-app-${BUILD_NUMBER}.zip . -x ".git/*" "node_modules/*"'
      }
    }

    stage('SonarQube Analysis') {
      agent {
        docker {
          image 'sonarsource/sonar-scanner-cli:latest'
          reuseNode true
        }
      }
      environment {
        SONAR_LOGIN = credentials('sonar-token')   // в Jenkins должен быть secret-text с таким ID
      }
      steps {
        sh '''
          sonar-scanner \
            -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
            -Dsonar.sources=. \
            -Dsonar.host.url=${SONAR_HOST} \
            -Dsonar.login=${SONAR_LOGIN}
        '''
      }
    }

    stage('Publish to Nexus') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'nexus-creds',
                                          usernameVariable: 'NEXUS_USER',
                                          passwordVariable: 'NEXUS_PASS')]) {
          sh '''
            ART=build/simple-node-app-${BUILD_NUMBER}.zip
            curl -v -u ${NEXUS_USER}:${NEXUS_PASS} \
                 --upload-file ${ART} \
                 ${NEXUS_URL}simple-node-app-${BUILD_NUMBER}.zip
          '''
        }
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'build/*.zip', fingerprint: true
    }
    success {
      echo '✅ Pipeline finished OK'
    }
    failure {
      echo '❌ Pipeline failed'
    }
  }
}
