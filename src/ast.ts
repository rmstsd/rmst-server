import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import generate from '@babel/generator'
import * as types from '@babel/types'

export class CommentController {
  findAll(body: any): string {
    const { nodes, commandResultArray } = body

    const code = `const nodesString = ` + JSON.stringify(nodes)

    const ast = parse(code)

    traverse(ast, {
      ObjectExpression(path: any) {
        const keys = path.node.properties.map(nodeItem => nodeItem.key.value)

        if (keys.includes('type') && keys.includes('inputs') && keys.includes('outputs')) {
          const commandType = path.node.properties.find(nodeItem => nodeItem.key.value === 'type').value.value

          // console.log('单个指令', commandType)

          path.node.properties.forEach(nodeItem => {
            // 如果拿到的是指令对象
            // console.log(nodeItem)
            if (nodeItem.key.value === 'inputs' || nodeItem.key.value === 'outputs') {
              const inputsProperties = nodeItem.value.properties
              // inputsProperties.find(nodeItem => nodeItem.key.name === 'type')

              // console.log('--> ', inputsProperties)

              inputsProperties.forEach(propertyItem => {
                // console.log(propertyItem)

                const comment = getComment(commandType, propertyItem.key.value, commandResultArray)
                if (comment) types.addComment(propertyItem, 'trailing', comment)
              })
            }
          })
        }
      }
    })

    const nvCode = generate(ast, {}).code

    // console.log(nvCode)

    return nvCode.slice(nvCode.indexOf('=') + 1)
  }
}

function getComment(commandType, key, commandResultArray) {
  const fop = getFieldOption(commandResultArray, commandType, key)

  if (!fop) return null

  if (fop.dataSource) {
    return `${fop.title}: 可选值: ${fop.dataSource.map(item => item.value).join(' | ')}`
  }

  return fop.title
}

function getFieldOption(commandResultArray, nodeType, key) {
  function getBackEndJsonByCommandType(): any[] {
    return JSON.parse(commandResultArray.find(item => item.commandType === nodeType).jsonPropertiesPane)
  }

  const backEndJson = getBackEndJsonByCommandType()

  const flatJsonArray = backEndJson.reduce((acc, groupItem) => {
    return acc.concat(groupItem.items)
  }, [])

  return flatJsonArray.find(item => item.name === key)
}
