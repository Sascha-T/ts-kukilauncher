
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
            }
        }
	    stage('Packaging') {
		    steps {
		    	sh 'npm run package'
                sh 'node package.js'
		    }
	    }
        stage('Archiving') {
		    steps {
				archiveArtifacts artifacts: 'release/installer32/Setup.exe'
			    archiveArtifacts artifacts: 'release/installer64/Setup.exe'
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
            sh 'tree'
            echo 'Failed!'
        }
        changed {
            echo 'Files were changed.'
        }
    }
}
