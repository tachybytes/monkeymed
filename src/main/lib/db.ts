import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getQuestions() {
  const data = await prisma.question.findMany({
    include: {
      choices: true,
      tags: true,
      userChoice: {
        include: {
          userChoice: true
        }
      }
    }
  })
  console.log(data)
  return data
}

export async function saveChoice(userChoiceId, selectedQuestion, delta) {
  console.log(`Attempting to create UserChoiceID: ${userChoiceId}`)
  console.log('Selected question is:', selectedQuestion)
  await prisma.userChoice.create({
    data: {
      userChoiceId: userChoiceId,
      questionId: selectedQuestion.id,
      timeTaken: delta
    }
  })
  console.log('User choice saved!')
}

export async function getLastSeen(question) {
  console.log('Attempting to get LastSeen from questionID:', question.id)
  const lastSeen = await prisma.userChoice.findFirst({
    where: {
      userChoice: {
        belongsTo: {
          id: question.id
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
  return lastSeen
}

export async function saveComments(comments, id) {
  await prisma.question.update({
    where: {
      id: id
    },
    data: {
      comments: comments
    }
  })
  console.log('Comment saved!')
}

export async function createQuestion(question, choices, tags) {
  const newQuestion = await prisma.question.create({
    data: {
      question: question
    }
  })
  console.log('New question is:', newQuestion)

  // Use a loop to create each choice individually
  const newChoices = await Promise.all(
    choices.map(async (choice) => {
      return await prisma.choice.create({
        data: {
          choice: choice.text,
          isTrue: choice.isTrue,
          belongsToId: newQuestion.id
        }
      })
    })
  )

  const newTags = await Promise.all(
    tags.map(async (tag) => {
      return await prisma.tag.create({
        data: {
          tag: tag,
          belongsToId: newQuestion.id
        }
      })
    })
  )
  console.log('Question created with success!')
}

export async function deleteQuestion(selectedQuestion) {
  await prisma.question.delete({
    where: {
      id: selectedQuestion.id
    }
  })
  console.log('Question deleted:', selectedQuestion.id)
}

export async function updateQuestion(selectedQuestion, tags) {
  await prisma.question.update({
    where: {
      id: selectedQuestion.id
    },
    data: {
      question: selectedQuestion.question
    }
  })
  console.log('Question updated:', selectedQuestion.question)

  // Step 1: Delete all current tags for the selected question
  await prisma.tag.deleteMany({
    where: {
      belongsToId: selectedQuestion.id
    }
  })

  // Step 2: Create new tags from the array
  await Promise.all(
    tags.map(async (tag) => {
      return await prisma.tag.create({
        data: {
          tag: tag,
          belongsToId: selectedQuestion.id
        }
      })
    })
  )
  console.log("Tags updated:", selectedQuestion.tags)
}
