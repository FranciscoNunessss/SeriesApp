pipeline {
	agent none

	options {
		timestamps()
		disableConcurrentBuilds()
		skipDefaultCheckout(true)
	}

	environment {
		PIP_DISABLE_PIP_VERSION_CHECK = '1'
		PYTHONDONTWRITEBYTECODE = '1'
		PYTHONUNBUFFERED = '1'
		NPM_CONFIG_AUDIT = 'false'
		NPM_CONFIG_FUND = 'false'
	}

	stages {
		stage('Checkout') {
			agent any
			steps {
				checkout scm
			}
		}

		stage('Backend Checks') {
			agent {
				docker {
					image 'python:3.14-slim'
					reuseNode true
				}
			}
			steps {
				sh '''
					python -m pip install --upgrade pip
					pip install -r requirements.txt
					python -m compileall src
					pip check
				'''
			}
		}

		stage('Frontend Build') {
			agent {
				docker {
					image 'node:20-alpine'
					reuseNode true
				}
			}
			steps {
				dir('frontend') {
					sh '''
						npm ci
						npm run build
					'''
				}
			}
			post {
				success {
					archiveArtifacts artifacts: 'frontend/dist/**', allowEmptyArchive: true
				}
			}
		}

		stage('Docker Images') {
			when {
				anyOf {
					branch 'main'
					branch 'master'
				}
			}
			agent any
			steps {
				sh '''
					docker build -t seriesapp-api:${BUILD_NUMBER} .
					docker build -t seriesapp-frontend:${BUILD_NUMBER} ./frontend
				'''
			}
		}
	}

	post {
		always {
			cleanWs()
		}
	}
}
