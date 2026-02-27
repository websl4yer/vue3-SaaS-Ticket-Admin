// src/directives/permission.ts
import type { DirectiveBinding } from 'vue'
import { useUserStore } from '../store/user'

export const permissionDirective = {
  // 当被绑定的元素挂载到 DOM 上时触发
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    // 1. 获取传入的权限数组，例如 v-permission="['admin']"
    const { value } = binding
    
    // 2. 获取当前登录用户的角色
    const userStore = useUserStore()
    const currentRole = userStore.role

    // 3. 校验逻辑
    if (value && Array.isArray(value) && value.length > 0) {
      // 如果当前角色不在允许的数组里
      const hasPermission = value.includes(currentRole)
      
      if (!hasPermission) {
        // 核心：无权限时，找到父节点，把当前元素自己删掉！
        el.parentNode?.removeChild(el)
      }
    } else {
      throw new Error(`需要指定权限标识！例如 v-permission="['admin']"`)
    }
  }
}