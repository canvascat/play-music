<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

const emits = defineEmits<{
	success: [];
}>();

const zodSchema = z.object({
	cookie: z.string().min(1, "请输入 Cookie 值"),
});
const formSchema = toTypedSchema(zodSchema);

function onSubmit(values: any) {
	document.cookie = values.cookie;
	emits("success");
}
</script>

<template>
	<Form v-slot="{ handleSubmit }" as="" :keep-values="true" :validation-schema="formSchema">
		<Card>
			<CardHeader>
				<CardDescription> 通过 Cookie 登录网易云音乐，请输入 Cookie 值。 </CardDescription>
			</CardHeader>
			<CardContent class="sm:max-w-[425px]">
				<form id="dialogForm" @submit="handleSubmit($event, onSubmit)">
					<FormField
						v-slot="{ componentField }"
						name="cookie"
						:validate-on-blur="false"
						:validate-on-input="false"
					>
						<FormItem>
							<FormControl>
								<Textarea
									placeholder="Cookie"
									v-bind="componentField"
									rows="6"
									class="max-h-[300px]"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					</FormField>
				</form>
			</CardContent>
			<CardFooter>
				<Button type="submit" form="dialogForm" class="w-full"> 登录 </Button>
			</CardFooter>
		</Card>
	</Form>
</template>
