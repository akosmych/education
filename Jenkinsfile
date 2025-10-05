pipeline {
  agent none

  environment {
    SONAR_HOST = "http://sonarqube:9000"          // в docker-compose используйте имя сервиса
    SONAR_PROJECT_KEY = "simple-node-app"
    NEXUS_URL = "http://nexus:8081/repository/raw-releases/" // raw-hosted repo
  }

  stages {
    stage('Checkout') {
      agent any
      steps { checkout scm }
    }

    stage('Install & Test') {
      // запускаем в контейнере с Node (нужен docker-адаптер на Jenkins)
      agent { docker { image 'node:18' } }
      steps {
        sh 'npm ci || true'          // нет package-lock — npm ci может вернуть ошибку, но в простом проекте ok
        sh 'npm run test'
        sh 'mkdir -p build'
        sh 'zip -r build/simple-node-app-${BUILD_NUMBER}.zip . -x .git/* node_modules/*'
      }
    }

    stage('SonarQube Analysis') {
      // используем официальный CLI-образ sonar-scanner (нужен docker на Jenkins)
      agent { docker { image 'sonarsource/sonar-scanner-cli:latest' } }
      environment {
        SONAR_LOGIN = credentials('sonar-token') // добавите credential в Jenkins (see ниже)
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
      agent any
      steps {
        withCredentials([usernamePassword(credentialsId: 'nexus-creds', usernameVariable: 'NEXUS_USER', passwordVariable: 'NEXUS_PASS')]) {
          sh '''
            ART=build/simple-node-app-${BUILD_NUMBER}.zip
            curl -v -u ${NEXUS_USER}:${NEXUS_PASS} --upload-file ${ART} ${NEXUS_URL}simple-node-app-${BUILD_NUMBER}.zip
          '''
        }
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'build/*.zip', fingerprint: true
    }
    success { echo '✅ Pipeline finished OK' }
    failure { echo '❌ Pipeline failed' }
  }
}
