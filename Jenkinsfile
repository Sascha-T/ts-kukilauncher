
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
		sh 'tsc'
                sh 'npm run package'
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
