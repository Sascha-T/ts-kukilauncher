
pipeline {
    agent any
    stages {
        stage('Prepare') {
            parallel {
                stage ('Checkout') {
					steps {
						checkout scm
						sh 'git submodule update --init'
						echo "My branch is: ${env.BRANCH_NAME}"
					}
				}
            }
        }
		stage('Build') {
            steps {
		        sh 'npm i --dev'
                sh './node_modules/.bin/tsc'
                sh 'npm run package'
                sh 'node build.js'
                sh 'tree node_modules'
                archiveArtifacts artifacts: 'dist/*.tar.gz'
		        archiveArtifacts artifacts: 'release/**/*.exe'
                archiveArtifacts artifacts: 'release/**/*.msi'
            }
        }
    }
    post {
        always {
            echo 'Done.'
            deleteDir() 
        }
        success {
            echo 'Sucess!'
        }
        unstable {
            echo 'Unstable.'
        }
        failure {
            echo 'Failed!'
        }
        changed {
            echo 'Files were changed.'
        }
    }
}