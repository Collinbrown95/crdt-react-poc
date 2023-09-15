import React from 'react';
import { Button, Form, Input, Select, DatePicker } from 'antd';
import type { FormInstance } from 'antd/es/form';

const { Option } = Select;

const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};

const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
};

export interface FormProps {
    date: string;
    status: string;
}

interface MyFormProps {
    onSubmit: (formData: FormProps) => void;
}

const MyForm: React.FC<MyFormProps> = ({ onSubmit }) => {
    const formRef = React.useRef<FormInstance>(null);

    const onFinish = (values: any) => {
        onSubmit(values);
    };

    return (
        <Form
            {...layout}
            ref={formRef}
            name="control-ref"
            onFinish={onFinish}
            style={{ maxWidth: 600 }}
        >
            <Form.Item name="date" label="Case Date">
                <DatePicker />
            </Form.Item>
            <Form.Item name="status" label="TB Status" rules={[{ required: true }]}>
                <Select
                    placeholder="Select a option and change input text above"
                    allowClear
                >
                    <Option value="Positive">Positive</Option>
                    <Option value="Negative">Negative</Option>
                    <Option value="Unknown">Unknown</Option>
                </Select>
            </Form.Item>
            <Form.Item {...tailLayout}>
                <Button type="primary" htmlType="submit">
                    Submit
                </Button>
            </Form.Item>
        </Form>
    );
};

export default MyForm;