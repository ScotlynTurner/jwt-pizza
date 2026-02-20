import React from "react";
import { useLocation } from "react-router-dom";
import Button from "../components/button";
import { useBreadcrumb } from "../hooks/appNavigation";
import { pizzaService } from "../service/service";
import View from "./view";

export default function DeleteUser() {
    const state = useLocation().state;
    const navigateToParentPath = useBreadcrumb();
  
    async function deleteUser() {
      await pizzaService.deleteUser(state.user);
      navigateToParentPath();
    }
  
    return (
      <View title='You Are About To Delete A User'>
        <div className='text-start py-8 px-4 sm:px-6 lg:px-8'>
          <div className='text-neutral-100'>
            Are you sure you want to delete <span className='text-orange-500'>{state.user.name}</span> as a user? This will delete all associated data and cannot be restored.
          </div>
          <Button title='Delete' onPress={deleteUser} />
          <Button title='Cancel' onPress={navigateToParentPath} className='bg-transparent border-neutral-300' />
        </div>
      </View>
    );
}